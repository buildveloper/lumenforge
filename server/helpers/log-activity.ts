import { db } from "@/lib/db";
import { activityLogs } from "@/db/schema";

function generateId(): string {
  return crypto.randomUUID();
}

export async function logActivity({
  userId,
  action,
  entityType,
  entityId,
}: {
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
}) {
  await db.insert(activityLogs).values({
    id: generateId(),
    userId,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString(),
  });
}
