import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients, projects } from "@/db/schema";
import {
  createNotification,
  type NotificationKind,
} from "@/server/helpers/create-notification";

/**
 * Notifies the client linked to a project, if there is one.
 *
 * This is what makes the portal worth signing into and what gives the
 * `notifyTaskAssignments` / `notifyInvoiceStatus` / `notifyProjectUpdates`
 * switches something real to control. `tasks.assignee` is free text with no
 * account behind it, so there is no assignee to notify: the client is the only
 * other party who actually receives these.
 */
export async function notifyProjectClient(
  projectId: string,
  payload: {
    title: string;
    message: string;
    kind: NotificationKind;
    type: string;
  }
) {
  const [row] = await db
    .select({ clientUserId: clients.clientUserId })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.id, projectId))
    .limit(1);

  const recipient = row?.clientUserId;
  if (!recipient) return;

  await createNotification({
    userId: recipient,
    title: payload.title,
    message: payload.message,
    kind: payload.kind,
    type: payload.type,
    entityType: "project",
    entityId: projectId,
  });
}
