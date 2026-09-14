import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications, users } from "@/db/schema";

export type NotificationKind = "project" | "task" | "invoice" | "ai";

/**
 * Each notification maps to one preference the user can actually switch off in
 * settings. Approvals ride on project updates rather than inventing a fifth
 * toggle.
 */
const PREFERENCE_COLUMN = {
  project: users.notifyProjectUpdates,
  task: users.notifyTaskAssignments,
  invoice: users.notifyInvoiceStatus,
  ai: users.notifyAiCompletion,
} as const;

async function wantsNotification(userId: string, kind: NotificationKind) {
  const column = PREFERENCE_COLUMN[kind];
  const [row] = await db
    .select({ enabled: column })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return row?.enabled ?? true;
}

export async function createNotification({
  userId,
  title,
  message,
  kind,
  type,
  entityType,
  entityId,
}: {
  userId: string;
  title: string;
  message?: string;
  kind: NotificationKind;
  type: string;
  entityType?: string;
  entityId?: string;
}) {
  if (!(await wantsNotification(userId, kind))) return;

  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId,
    title,
    message: message ?? null,
    type,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    isRead: false,
    createdAt: new Date().toISOString(),
  });
}
