"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db, ensureDatabaseReady } from "@/lib/db";
import { users } from "@/db/schema";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  changePasswordSchema,
  signInSchema,
  signUpSchema,
  type ChangePasswordInput,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import {
  createSession,
  destroyAllSessions,
  destroySession,
  requireUserId,
  setSessionCookie,
} from "@/server/helpers/session";

/**
 * Auth actions return a result rather than throwing.
 *
 * This is the one place that deliberately breaks the "throw, don't return an
 * error envelope" rule the rest of the app follows. A wrong password is an
 * expected outcome that has to reach the user with a specific message, and Next
 * redacts thrown error messages from Server Actions in production — a throw
 * would surface as a generic digest instead of "that password is incorrect".
 */
export type AuthResult = { ok: true } | { ok: false; error: string };

/**
 * Turns a database failure into something the person at the keyboard can act
 * on. A generic "couldn't reach the database" costs another round trip with
 * nothing to go on, so the class of failure is named while the full error stays
 * in the server log.
 */
function describeDatabaseError(error: unknown): string {
  // Drizzle wraps driver failures in `Failed query: <sql>`. The SQL is noise and
  // the real problem is in `cause`, so the cause is collected first — otherwise
  // a truncated message shows only the wrapper and says nothing useful.
  const cause = (error as { cause?: unknown } | null)?.cause;
  const causeMessage = cause
    ? cause instanceof Error
      ? cause.message
      : String(cause)
    : "";

  const code =
    typeof (error as { code?: unknown })?.code === "string"
      ? ((error as { code: string }).code)
      : typeof (cause as { code?: unknown })?.code === "string"
        ? (cause as { code: string }).code
        : "";

  const wrapperMessage =
    error instanceof Error ? error.message : String(error);

  const message = [causeMessage, code, wrapperMessage]
    .filter(Boolean)
    .join(" — ");

  // A hosted database answers with an HTTP status, which names the problem
  // precisely: 404 is a wrong address, 401/403 is a wrong token.
  const status = message.match(/HTTP status (\d{3})/i)?.[1];
  if (status === "404") {
    return "That database address does not exist. Check TURSO_DATABASE_URL in your host's environment variables; it should look like libsql://<name>-<org>.turso.io.";
  }
  if (status === "401" || status === "403") {
    return "The database refused the token. Check TURSO_AUTH_TOKEN in your host's environment variables.";
  }

  if (/no such table/i.test(message)) {
    return "The database is reachable but has no tables yet. Run `npm run db:migrate` and restart, or set TURSO_DATABASE_URL on a deployed instance.";
  }
  if (/no such column/i.test(message)) {
    return "The database schema is out of date. Run `npm run db:migrate` and restart the app.";
  }
  if (/SQLITE_READONLY|readonly|WRITE_NOT_ALLOWED|read-only|EROFS/i.test(message)) {
    return "The database is read-only, so nothing can be written. On a serverless host this means no database is configured — set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.";
  }
  if (/SQLITE_CANTOPEN|unable to open|ENOENT|SQLITE_IOERR|not a database|permission|EACCES/i.test(message)) {
    return "The database file couldn't be opened. Check that TURSO_DATABASE_URL points somewhere writable, then run `npm run db:migrate`.";
  }
  if (/SQLITE_BUSY|database is locked/i.test(message)) {
    return "The database is locked by another process. Stop the app, run `npm run db:migrate`, then start it again.";
  }
  if (/SQLITE_AUTH|UNAUTHORIZED|401|403|token/i.test(message)) {
    return "The database rejected the credentials. Check TURSO_AUTH_TOKEN.";
  }
  if (/fetch failed|ECONNREFUSED|ENOTFOUND|ENETUNREACH|timeout|network/i.test(message)) {
    return "The database server could not be reached. Check that TURSO_DATABASE_URL is correct and reachable.";
  }

  // Still unrecognised: show the message rather than describing it. Withholding
  // it costs another round trip and helps nobody.
  const excerpt = message.slice(0, 220) || "(no message)";
  return `The database reported: ${excerpt}`;
}

// -- Brute-force throttle ------------------------------------------------------

const ATTEMPT_LIMIT = 8;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Per-instance and in-memory, matching the rate limiter in middleware. It stops
 * a single client hammering one account; it is not a defence against a
 * distributed attack, which would need shared state.
 */
function tooManyAttempts(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > ATTEMPT_LIMIT;
}

function clearAttempts(key: string) {
  attempts.delete(key);
}

// -- Timing equaliser ----------------------------------------------------------

let dummyHash: string | null = null;

/**
 * Hashing against a dummy when no account exists keeps a failed sign-in the
 * same duration either way, so response time does not reveal which email
 * addresses are registered.
 */
async function equalizeTiming(password: string) {
  dummyHash ??= await hashPassword("lumenforge-timing-equalizer");
  await verifyPassword(password, dummyHash);
}

// -- Sign up -------------------------------------------------------------------

export async function signUp(input: SignUpInput): Promise<AuthResult> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const email = parsed.data.email.toLowerCase();

  if (tooManyAttempts(`signup:${email}`)) {
    return { ok: false, error: "Too many attempts. Try again in a few minutes." };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  try {
    await ensureDatabaseReady();

    await db.insert(users).values({
      id,
      email,
      name: parsed.data.name,
      passwordHash,
      role: "user",
      createdAt: now,
      updatedAt: now,
    });

    await logActivity({
      userId: id,
      action: "account.created",
      entityType: "user",
      entityId: id,
    });

    const { token, expiresAt } = await createSession(id);
    await setSessionCookie(token, expiresAt);
  } catch (error) {
    // The unique index is the real guard; a pre-check would race.
    if (String(error).includes("UNIQUE")) {
      return {
        ok: false,
        error: "An account with that email already exists. Sign in instead.",
      };
    }
    console.error("[LumenForge] sign-up failed:", error);
    return { ok: false, error: describeDatabaseError(error) };
  }

  clearAttempts(`signup:${email}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

// -- Sign in -------------------------------------------------------------------

export async function signIn(input: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const email = parsed.data.email.toLowerCase();

  if (tooManyAttempts(`signin:${email}`)) {
    return {
      ok: false,
      error: "Too many attempts for this account. Try again in a few minutes.",
    };
  }

  // One message for a missing account and for a wrong password: never confirm
  // which email addresses are registered.
  const invalid: AuthResult = {
    ok: false,
    error: "That email and password don't match an account.",
  };

  try {
    await ensureDatabaseReady();

    const [user] = await db
      .select({
        id: users.id,
        passwordHash: users.passwordHash,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || user.deletedAt) {
      await equalizeTiming(parsed.data.password);
      return invalid;
    }

    if (!(await verifyPassword(parsed.data.password, user.passwordHash))) {
      return invalid;
    }

    const { token, expiresAt } = await createSession(user.id);
    await setSessionCookie(token, expiresAt);
  } catch (error) {
    console.error("[LumenForge] sign-in failed:", error);
    return { ok: false, error: describeDatabaseError(error) };
  }

  clearAttempts(`signin:${email}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

// -- Sign out ------------------------------------------------------------------

export async function signOut(): Promise<AuthResult> {
  await destroySession();
  revalidatePath("/", "layout");
  return { ok: true };
}

// -- Account -------------------------------------------------------------------

export async function updateProfile(input: { name: string }): Promise<AuthResult> {
  const userId = await requireUserId();
  const name = input.name.trim().slice(0, 120);

  await db
    .update(users)
    .set({ name: name || null, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
  return { ok: true };
}

export async function changePassword(
  input: ChangePasswordInput
): Promise<AuthResult> {
  const userId = await requireUserId();
  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check the form." };
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return { ok: false, error: "Account not found." };

  if (!(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return { ok: false, error: "That current password isn't right." };
  }

  const passwordHash = await hashPassword(parsed.data.newPassword);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  await logActivity({
    userId,
    action: "account.password_changed",
    entityType: "user",
    entityId: userId,
  });

  // A password change should end every other session. The current one is
  // reissued so the person who just changed it is not signed out too.
  await destroyAllSessions(userId);
  const { token, expiresAt } = await createSession(userId);
  await setSessionCookie(token, expiresAt);

  revalidatePath("/settings");
  return { ok: true };
}
