import "server-only";

import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";

/**
 * Request-scoped identity.
 *
 * Every server action used to resolve the Clerk user and re-read the role row
 * independently, so a single page load issued the same lookup a dozen times.
 * Against a local SQLite file that is free; against remote libSQL each one is a
 * network round trip. `cache` collapses them to one per request.
 */

export const getClerkUser = cache(async () => currentUser());

export const requireUserId = cache(async (): Promise<string> => {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
});

/**
 * Mirrors the Clerk account into our table once per request.
 *
 * `onConflictDoNothing` covers two requests racing on a brand-new account.
 * Failures are allowed to propagate: silently continuing without a user row is
 * what previously let an existing account be shown the role picker again.
 */
export const ensureUserRow = cache(async (): Promise<void> => {
  const userId = await requireUserId();

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existing) return;

  const clerkUser = await getClerkUser();
  const email =
    clerkUser?.primaryEmailAddress?.emailAddress ??
    clerkUser?.emailAddresses?.[0]?.emailAddress ??
    `${userId}@user.lumenforge`;
  const name = clerkUser?.firstName
    ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
    : null;
  const now = new Date().toISOString();

  await db
    .insert(users)
    .values({
      id: userId,
      email,
      role: "user",
      name,
      avatarUrl: clerkUser?.imageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing();
});

export const requireUserRole = cache(async (): Promise<string> => {
  const userId = await requireUserId();
  await ensureUserRow();

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.role ?? "user";
});
