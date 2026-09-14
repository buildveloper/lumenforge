import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";
import { and, eq, gt, isNull, lt } from "drizzle-orm";

import { db } from "@/lib/db";
import { sessions, users } from "@/db/schema";
import { generateSessionToken } from "@/lib/password";
import { SESSION_COOKIE, SESSION_DURATION_MS } from "@/lib/session-cookie";

/**
 * Request-scoped identity, backed by the `sessions` table.
 *
 * Only the SHA-256 of a token is stored, so a database leak does not hand over
 * usable sessions. Everything is wrapped in React `cache()` so a page load
 * resolves identity once rather than once per action.
 */

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export const getSessionToken = cache(async (): Promise<string | null> => {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
});

/** Creates a session row and returns the raw token, which is never stored. */
export async function createSession(userId: string) {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  // Opportunistic cleanup: this is the one moment we know the table is about
  // to grow, and expired rows are dead weight.
  await db
    .delete(sessions)
    .where(lt(sessions.expiresAt, new Date().toISOString()));

  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId,
    tokenHash: hashToken(token),
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
  });

  return { token, expiresAt };
}

export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/** Ends the current session server-side as well as in the browser. */
export async function destroySession() {
  const token = await getSessionToken();

  if (token) {
    await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  }

  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Every session for a user. A password change uses this to sign other devices out. */
export async function destroyAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/**
 * The signed-in user's id, or null.
 *
 * The cookie is only a lookup key. It is checked against an unexpired session
 * row joined to a live user, so a forged or stale cookie resolves to null.
 *
 * A database failure resolves to null rather than throwing. That is the safe
 * direction — an unverifiable session is not a session — and it also means a
 * broken database degrades to "you are signed out" instead of taking down the
 * sign-in page, which is the one screen that could explain what is wrong.
 */
export const getUserId = cache(async (): Promise<string | null> => {
  const token = await getSessionToken();
  if (!token) return null;

  try {
    const [row] = await db
      .select({ userId: sessions.userId })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.tokenHash, hashToken(token)),
          gt(sessions.expiresAt, new Date().toISOString()),
          isNull(users.deletedAt)
        )
      )
      .limit(1);

    return row?.userId ?? null;
  } catch (error) {
    console.error("[LumenForge] session lookup failed:", error);
    return null;
  }
});

export const requireUserId = cache(async (): Promise<string> => {
  const userId = await getUserId();
  if (!userId) throw new Error("Unauthorized");
  return userId;
});

export const requireUserRole = cache(async (): Promise<string> => {
  const userId = await requireUserId();

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.role ?? "user";
});
