import "server-only";

import { and, eq, inArray, isNull, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients } from "@/db/schema";

/**
 * Client-scoped reads resolve through `clients.client_user_id`.
 *
 * The previous build compared `projects.client_id` (a `clients.id`) against the
 * signed-in Clerk `user_id`, which can never match, so every client-facing list
 * was empty. These helpers are the single place that resolves the link.
 */

/** Client record ids this user has claimed. Empty for freelancers. */
export async function linkedClientIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ id: clients.id })
    .from(clients)
    .where(and(eq(clients.clientUserId, userId), isNull(clients.deletedAt)));

  return rows.map((row) => row.id);
}

/**
 * Claims unclaimed client records whose email matches the signed-in user, so a
 * client sees their work as soon as they sign up with the address the
 * freelancer already had on file. Returns how many records were claimed.
 *
 * Records already claimed by someone else are left alone.
 */
export async function claimClientRecords(
  userId: string,
  email: string
): Promise<number> {
  const address = email.trim().toLowerCase();
  if (!address) return 0;

  const matches = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        isNull(clients.deletedAt),
        isNull(clients.clientUserId),
        ne(clients.userId, userId),
        sql`lower(${clients.email}) = ${address}`
      )
    );

  if (matches.length === 0) return 0;

  const now = new Date().toISOString();
  await db
    .update(clients)
    .set({ clientUserId: userId, claimedAt: now, updatedAt: now })
    .where(
      inArray(
        clients.id,
        matches.map((row) => row.id)
      )
    );

  return matches.length;
}
