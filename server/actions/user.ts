"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/db/schema";
import {
  notificationPreferencesSchema,
  updateRoleSchema,
  type NotificationPreferencesInput,
  type UpdateRoleInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { claimClientRecords } from "@/server/helpers/client-access";
import { ensureUserRow, getClerkUser, requireUserId } from "@/server/helpers/session";

export async function updateUserRole(input: UpdateRoleInput) {
  const userId = await requireUserId();
  const { role } = updateRoleSchema.parse(input);

  await ensureUserRow();

  await db
    .update(users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  await logActivity({
    userId,
    action: "role.updated",
    entityType: "user",
    entityId: userId,
  });

  // Taking the client role should immediately surface any work already
  // addressed to this person's email address.
  let claimed = 0;
  if (role === "client") {
    const clerkUser = await getClerkUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress;
    if (email) claimed = await claimClientRecords(userId, email);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true as const, role, claimed };
}

export async function getDashboardData() {
  const userId = await requireUserId();
  await ensureUserRow();

  const [user] = await db
    .select({ role: users.role, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    role: user?.role ?? "user",
    name: user?.name ?? null,
    email: user?.email ?? null,
  };
}

/** Display name and avatar for anything that greets the user by name. */
export async function getProfile() {
  const userId = await requireUserId();
  await ensureUserRow();

  const [row] = await db
    .select({
      name: users.name,
      email: users.email,
      role: users.role,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  const clerkUser = await getClerkUser();

  return {
    name: row?.name ?? clerkUser?.fullName ?? null,
    email: row?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? null,
    role: row?.role ?? "user",
    avatarUrl: row?.avatarUrl ?? clerkUser?.imageUrl ?? null,
  };
}

export async function getNotificationPreferences() {
  const userId = await requireUserId();
  await ensureUserRow();

  const [row] = await db
    .select({
      notifyProjectUpdates: users.notifyProjectUpdates,
      notifyTaskAssignments: users.notifyTaskAssignments,
      notifyInvoiceStatus: users.notifyInvoiceStatus,
      notifyAiCompletion: users.notifyAiCompletion,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return (
    row ?? {
      notifyProjectUpdates: true,
      notifyTaskAssignments: true,
      notifyInvoiceStatus: true,
      notifyAiCompletion: false,
    }
  );
}

export async function updateNotificationPreferences(
  input: NotificationPreferencesInput
) {
  const userId = await requireUserId();
  const parsed = notificationPreferencesSchema.parse(input);

  await db
    .update(users)
    .set({ ...parsed, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

  revalidatePath("/settings");
  return { success: true as const };
}
