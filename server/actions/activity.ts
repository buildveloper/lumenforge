"use server";

import { db } from "@/lib/db";
import { activityLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

// -- Helpers ------------------------------------------------------------------

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// -- Get Recent Activity ------------------------------------------------------

export async function getRecentActivity(limit = 10) {
  const userId = await getUserId();

  return db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.userId, userId))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}
