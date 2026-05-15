import { db } from "@/lib/db";
import { notifications } from "@/db/schema";

export async function createNotification({
  userId,
  title,
  message,
  type,
  entityType,
  entityId,
}: {
  userId: string;
  title: string;
  message?: string;
  type: string;
  entityType?: string;
  entityId?: string;
}) {
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
