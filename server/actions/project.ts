"use server";

import { revalidatePath } from "next/cache";
import { eq, and, isNull, desc, count, or, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { activityLogs, clients, invoices, projects, tasks } from "@/db/schema";
import {
  createProjectSchema,
  projectApprovalSchema,
  projectIdSchema,
  updateProjectSchema,
  paginationSchema,
  type CreateProjectInput,
  type ProjectApprovalInput,
  type UpdateProjectInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { createNotification } from "@/server/helpers/create-notification";
import { linkedClientIds } from "@/server/helpers/client-access";
import { requireUserId, requireUserRole } from "@/server/helpers/session";

const PROJECT_COLUMNS = {
  id: projects.id,
  userId: projects.userId,
  clientId: projects.clientId,
  title: projects.title,
  description: projects.description,
  status: projects.status,
  budget: projects.budget,
  dueDate: projects.dueDate,
  createdAt: projects.createdAt,
  updatedAt: projects.updatedAt,
  deletedAt: projects.deletedAt,
};

function revalidateProjects(projectId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
}

// -- Create -------------------------------------------------------------------

export async function createProject(input: CreateProjectInput) {
  const userId = await requireUserId();
  const parsed = createProjectSchema.parse(input);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(projects).values({
    id,
    userId,
    clientId: parsed.clientId ?? null,
    title: parsed.title,
    description: parsed.description ?? null,
    status: parsed.status,
    budget: parsed.budget,
    dueDate: parsed.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity({
    userId,
    action: "project.created",
    entityType: "project",
    entityId: id,
  });

  await createNotification({
    userId,
    title: "Project created",
    message: `“${parsed.title}” is ready to work on`,
    kind: "project",
    type: "project_created",
    entityType: "project",
    entityId: id,
  });

  revalidateProjects();
  return { success: true as const, projectId: id, title: parsed.title };
}

// -- Read ---------------------------------------------------------------------

/**
 * Role-aware list with task progress. A client sees the projects where they are
 * the linked client; a freelancer sees the ones they own. The client branch
 * previously compared a clients.id against a Clerk id, so it matched nothing.
 */
export async function getUserProjects(
  pagination: { page?: number; limit?: number; clientId?: string } = {}
) {
  const userId = await requireUserId();
  const role = await requireUserRole();
  const { page, limit } = paginationSchema.parse(pagination);
  const offset = (page - 1) * limit;

  const conditions = [isNull(projects.deletedAt)];

  if (role === "client") {
    const ids = await linkedClientIds(userId);
    const scope = ids.length
      ? or(eq(projects.userId, userId), inArray(projects.clientId, ids))
      : eq(projects.userId, userId);
    conditions.push(scope!);
  } else {
    conditions.push(eq(projects.userId, userId));
  }

  if (pagination.clientId) {
    conditions.push(eq(projects.clientId, pagination.clientId));
  }

  const whereClause = and(...conditions);

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        ...PROJECT_COLUMNS,
        clientName: clients.name,
        clientCompany: clients.company,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(projects).where(whereClause),
  ]);

  const projectIds = rows.map((row) => row.id);
  const taskRows = projectIds.length
    ? await db
        .select({ projectId: tasks.projectId, status: tasks.status })
        .from(tasks)
        .where(and(inArray(tasks.projectId, projectIds), isNull(tasks.deletedAt)))
    : [];

  const progress = new Map<string, { done: number; total: number }>();
  for (const task of taskRows) {
    if (!task.projectId) continue;
    const entry = progress.get(task.projectId) ?? { done: 0, total: 0 };
    entry.total += 1;
    if (task.status === "done") entry.done += 1;
    progress.set(task.projectId, entry);
  }

  const total = totalResult[0]?.value ?? 0;

  return {
    projects: rows.map((row) => ({
      ...row,
      taskTotal: progress.get(row.id)?.total ?? 0,
      taskDone: progress.get(row.id)?.done ?? 0,
    })),
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  };
}

export async function getProjectById(projectId: string) {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const [project] = await db
    .select({
      ...PROJECT_COLUMNS,
      clientName: clients.name,
      clientCompany: clients.company,
      clientEmail: clients.email,
      clientUserId: clients.clientUserId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const isOwner = project.userId === userId;
  const isClientUser = role === "client" && project.clientUserId === userId;

  if (!isOwner && !isClientUser) throw new Error("Forbidden");

  return project;
}

/** Title-only project list, cheap enough to load in the app shell. */
export async function getProjectOptions() {
  const userId = await requireUserId();
  return db
    .select({ id: projects.id, title: projects.title })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)))
    .orderBy(desc(projects.updatedAt))
    .limit(50);
}

/**
 * Everything that happened on a project: its own entries plus those of the
 * tasks and invoices underneath it. This is what the Activity tab renders
 * instead of the previous "coming soon" placeholder.
 */
export async function getProjectActivity(projectId: string) {
  await getProjectById(projectId);

  const [taskIds, invoiceIds] = await Promise.all([
    db.select({ id: tasks.id }).from(tasks).where(eq(tasks.projectId, projectId)),
    db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.projectId, projectId)),
  ]);

  const scopes = [
    and(
      eq(activityLogs.entityType, "project"),
      eq(activityLogs.entityId, projectId)
    ),
  ];

  if (taskIds.length) {
    scopes.push(
      and(
        eq(activityLogs.entityType, "task"),
        inArray(
          activityLogs.entityId,
          taskIds.map((row) => row.id)
        )
      )
    );
  }

  if (invoiceIds.length) {
    scopes.push(
      and(
        eq(activityLogs.entityType, "invoice"),
        inArray(
          activityLogs.entityId,
          invoiceIds.map((row) => row.id)
        )
      )
    );
  }

  return db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      entityType: activityLogs.entityType,
      entityId: activityLogs.entityId,
      createdAt: activityLogs.createdAt,
    })
    .from(activityLogs)
    .where(or(...scopes))
    .orderBy(desc(activityLogs.createdAt))
    .limit(50);
}

// -- Update -------------------------------------------------------------------

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
) {
  const userId = await requireUserId();
  const { projectId: id } = projectIdSchema.parse({ projectId });
  const parsed = updateProjectSchema.parse(input);

  const [project] = await db
    .select({ id: projects.id, userId: projects.userId })
    .from(projects)
    .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");

  // Explicit nulls clear a field; absent keys leave it untouched.
  const updates: Partial<typeof projects.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.description !== undefined) updates.description = parsed.description;
  if (parsed.status !== undefined) updates.status = parsed.status;
  if (parsed.budget !== undefined) updates.budget = parsed.budget;
  if (parsed.dueDate !== undefined) updates.dueDate = parsed.dueDate;
  if (parsed.clientId !== undefined) updates.clientId = parsed.clientId;

  await db.update(projects).set(updates).where(eq(projects.id, id));

  await logActivity({
    userId,
    action: "project.updated",
    entityType: "project",
    entityId: id,
  });

  revalidateProjects(id);
  return { success: true as const };
}

// -- Client decision ----------------------------------------------------------

/**
 * The client's verdict on a project. Previously a `toast.success()` with
 * nothing behind it; now it writes an audit entry and notifies the freelancer,
 * and the resulting state is read back from those entries.
 */
export async function recordProjectDecision(input: ProjectApprovalInput) {
  const userId = await requireUserId();
  const parsed = projectApprovalSchema.parse(input);
  const project = await getProjectById(parsed.projectId);

  if (project.userId === userId) {
    throw new Error("Only the client on this project can record a decision");
  }

  const approved = parsed.decision === "approve";
  const action = approved ? "project.approved" : "project.changes_requested";

  await logActivity({
    userId,
    action,
    entityType: "project",
    entityId: parsed.projectId,
  });

  await createNotification({
    userId: project.userId,
    title: approved
      ? `${project.title} was approved`
      : `Changes requested on ${project.title}`,
    message:
      parsed.note ??
      (approved ? "Approved by your client" : "Your client asked for changes"),
    kind: "project",
    type: action,
    entityType: "project",
    entityId: parsed.projectId,
  });

  revalidatePath(`/dashboard/projects/${parsed.projectId}`);
  revalidatePath("/dashboard/activity");
  return { success: true as const, decision: parsed.decision };
}

/** The most recent client decision on a project, derived from the audit trail. */
export async function getLatestProjectDecision(projectId: string) {
  await getProjectById(projectId);

  const [row] = await db
    .select({ action: activityLogs.action, createdAt: activityLogs.createdAt })
    .from(activityLogs)
    .where(
      and(
        eq(activityLogs.entityType, "project"),
        eq(activityLogs.entityId, projectId),
        inArray(activityLogs.action, [
          "project.approved",
          "project.changes_requested",
        ])
      )
    )
    .orderBy(desc(activityLogs.createdAt))
    .limit(1);

  return row ?? null;
}

// -- Delete / restore ---------------------------------------------------------

export async function softDeleteProject(input: { projectId: string }) {
  const userId = await requireUserId();
  const { projectId } = projectIdSchema.parse(input);

  const [project] = await db
    .select({ id: projects.id, userId: projects.userId, title: projects.title })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();
  await db
    .update(projects)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(projects.id, projectId));

  await logActivity({
    userId,
    action: "project.deleted",
    entityType: "project",
    entityId: projectId,
  });

  revalidateProjects();
  return { success: true as const, title: project.title };
}

export async function restoreProject(input: { projectId: string }) {
  const userId = await requireUserId();
  const { projectId } = projectIdSchema.parse(input);

  const [project] = await db
    .select({ id: projects.id, userId: projects.userId, title: projects.title })
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");

  await db
    .update(projects)
    .set({ deletedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(projects.id, projectId));

  revalidateProjects(projectId);
  return { success: true as const, title: project.title };
}

// -- Counts -------------------------------------------------------------------

export async function getProjectCount() {
  const userId = await requireUserId();
  const [result] = await db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));
  return result?.value ?? 0;
}

/** Active projects for whoever is asking: owned as a freelancer, linked as a client. */
export async function getActiveProjectCount() {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const conditions = [isNull(projects.deletedAt), eq(projects.status, "active")];

  if (role === "client") {
    const ids = await linkedClientIds(userId);
    const scope = ids.length
      ? or(eq(projects.userId, userId), inArray(projects.clientId, ids))
      : eq(projects.userId, userId);
    conditions.push(scope!);
  } else {
    conditions.push(eq(projects.userId, userId));
  }

  const [result] = await db
    .select({ value: count() })
    .from(projects)
    .where(and(...conditions));

  return result?.value ?? 0;
}
