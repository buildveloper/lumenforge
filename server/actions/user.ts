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
import { requireUserId } from "@/server/helpers/session";

export async function updateUserRole(input: UpdateRoleInput) {
  const userId = await requireUserId();
  const { role } = updateRoleSchema.parse(input);

  const [account] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

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
  if (role === "client" && account?.email) {
    claimed = await claimClientRecords(userId, account.email);
  }

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { success: true as const, role, claimed };
}

export async function getDashboardData() {
  const userId = await requireUserId();

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

/** Display name and email for anything that greets the user by name. */
export async function getProfile() {
  const userId = await requireUserId();

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

  return {
    name: row?.name ?? null,
    email: row?.email ?? null,
    role: row?.role ?? "user",
    avatarUrl: row?.avatarUrl ?? null,
  };
}

export async function getNotificationPreferences() {
  const userId = await requireUserId();

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
