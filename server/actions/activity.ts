"use server";

import { and, desc, eq, inArray, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { activityLogs, projects } from "@/db/schema";
import { linkedClientIds } from "@/server/helpers/client-access";
import { requireUserId, requireUserRole } from "@/server/helpers/session";

/**
 * Recent activity for whoever is looking.
 *
 * A freelancer sees their own audit trail. A client sees the work their
 * freelancer did — previously a client saw only their own log rows, which is
 * just their own approvals, so their activity feed was effectively empty.
 */
export async function getRecentActivity(limit = 10) {
  const userId = await requireUserId();
  const role = await requireUserRole();

  // Deliberately excludes user_id: for a client these are the freelancer's rows,
  // and a raw account id is not something to render.
  const columns = {
    id: activityLogs.id,
    action: activityLogs.action,
    entityType: activityLogs.entityType,
    entityId: activityLogs.entityId,
    createdAt: activityLogs.createdAt,
  };

  if (role !== "client") {
    return db
      .select(columns)
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  const clientIds = await linkedClientIds(userId);
  if (clientIds.length === 0) return [];

  const owners = await db
    .selectDistinct({ userId: projects.userId })
    .from(projects)
    .where(
      and(inArray(projects.clientId, clientIds), isNull(projects.deletedAt))
    );

  const ownerIds = owners.map((row) => row.userId);
  if (ownerIds.length === 0) return [];

  return db
    .select(columns)
    .from(activityLogs)
    .where(inArray(activityLogs.userId, ownerIds))
    .orderBy(desc(activityLogs.createdAt))
    .limit(limit);
}
