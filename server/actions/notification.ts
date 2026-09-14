"use server";

import { revalidatePath } from "next/cache";
import { eq, desc, and, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { notifications } from "@/db/schema";
import { requireUserId } from "@/server/helpers/session";

// -- Get notifications ---------------------------------------------------------

export async function getNotifications(limit = 20) {
  const userId = await requireUserId();

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

// -- Get unread count ----------------------------------------------------------

export async function getUnreadCount() {
  const userId = await requireUserId();

  const [result] = await db
    .select({ value: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  return result?.value ?? 0;
}

// -- Mark as read --------------------------------------------------------------

export async function markAsRead(notificationId: string) {
  const userId = await requireUserId();

  const [notification] = await db
    .select({ userId: notifications.userId })
    .from(notifications)
    .where(eq(notifications.id, notificationId))
    .limit(1);

  if (!notification) throw new Error("Notification not found");
  if (notification.userId !== userId) throw new Error("Forbidden");

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.id, notificationId));

  revalidatePath("/dashboard/activity");
}

// -- Mark all as read ----------------------------------------------------------

export async function markAllAsRead() {
  const userId = await requireUserId();

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false))
    );

  revalidatePath("/dashboard/activity");
}
