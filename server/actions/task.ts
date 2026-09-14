"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients, projects, tasks } from "@/db/schema";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { linkedClientIds } from "@/server/helpers/client-access";
import { notifyProjectClient } from "@/server/helpers/notify-project-client";
import { requireUserId, requireUserRole } from "@/server/helpers/session";

async function verifyProjectWriteAccess(projectId: string, userId: string) {
  const [project] = await db
    .select({ userId: projects.userId, title: projects.title })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");
  return project;
}

/** Reads are allowed for the owner and for the client linked to the project. */
async function verifyProjectReadAccess(projectId: string, userId: string) {
  const [project] = await db
    .select({
      userId: projects.userId,
      clientUserId: clients.clientUserId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const role = await requireUserRole();
  const isOwner = project.userId === userId;
  const isClient = role === "client" && project.clientUserId === userId;

  if (!isOwner && !isClient) throw new Error("Forbidden");
  return project;
}

async function verifyTaskWriteAccess(taskId: string, userId: string) {
  const [task] = await db
    .select({ userId: tasks.userId, projectId: tasks.projectId })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
    .limit(1);

  if (!task) throw new Error("Task not found");
  if (task.userId !== userId) throw new Error("Forbidden");
  return task;
}

function revalidateTask(projectId?: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/activity");
}

// -- Create -------------------------------------------------------------------

export async function createTask(input: CreateTaskInput) {
  const userId = await requireUserId();
  const parsed = createTaskSchema.parse(input);

  if (parsed.projectId) {
    await verifyProjectWriteAccess(parsed.projectId, userId);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(tasks).values({
    id,
    userId,
    projectId: parsed.projectId ?? null,
    title: parsed.title,
    description: parsed.description ?? null,
    status: parsed.status,
    priority: parsed.priority,
    assignee: parsed.assignee ?? null,
    dueDate: parsed.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity({
    userId,
    action: "task.created",
    entityType: "task",
    entityId: id,
  });

  if (parsed.projectId) {
    await notifyProjectClient(parsed.projectId, {
      title: "New task added",
      message: parsed.title,
      kind: "task",
      type: "task_created",
    });
  }

  revalidateTask(parsed.projectId);
  return { success: true as const, taskId: id, title: parsed.title };
}

// -- Read ---------------------------------------------------------------------

export async function getProjectTasks(projectId: string) {
  const userId = await requireUserId();
  await verifyProjectReadAccess(projectId, userId);

  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)))
    .orderBy(desc(tasks.updatedAt));
}

export async function getUserTasks() {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const columns = {
    id: tasks.id,
    title: tasks.title,
    description: tasks.description,
    status: tasks.status,
    priority: tasks.priority,
    assignee: tasks.assignee,
    dueDate: tasks.dueDate,
    projectId: tasks.projectId,
    createdAt: tasks.createdAt,
    updatedAt: tasks.updatedAt,
    projectTitle: projects.title,
  };

  if (role === "client") {
    const ids = await linkedClientIds(userId);
    if (ids.length === 0) return [];

    return db
      .select(columns)
      .from(tasks)
      .leftJoin(projects, eq(tasks.projectId, projects.id))
      .where(
        and(
          isNull(tasks.deletedAt),
          inArray(
            tasks.projectId,
            db
              .select({ id: projects.id })
              .from(projects)
              .where(
                and(inArray(projects.clientId, ids), isNull(projects.deletedAt))
              )
          )
        )
      )
      .orderBy(tasks.dueDate, desc(tasks.updatedAt));
  }

  return db
    .select(columns)
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)))
    .orderBy(tasks.dueDate, desc(tasks.updatedAt));
}

/** Open work with its project, for the dashboard's attention list. */
export async function getOpenTasks(limit = 25) {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const conditions = [
    isNull(tasks.deletedAt),
    or(eq(tasks.status, "todo"), eq(tasks.status, "in_progress")),
  ];

  if (role === "client") {
    const ids = await linkedClientIds(userId);
    if (ids.length === 0) return [];
    conditions.push(
      inArray(
        tasks.projectId,
        db
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(inArray(projects.clientId, ids), isNull(projects.deletedAt))
          )
      )
    );
  } else {
    conditions.push(eq(tasks.userId, userId));
  }

  return db
    .select({
      id: tasks.id,
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
      dueDate: tasks.dueDate,
      projectId: tasks.projectId,
      projectTitle: projects.title,
    })
    .from(tasks)
    .leftJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(...conditions))
    .orderBy(desc(tasks.priority), tasks.dueDate)
    .limit(limit);
}

// -- Update -------------------------------------------------------------------

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const userId = await requireUserId();
  const { taskId: id } = taskIdSchema.parse({ taskId });
  const existing = await verifyTaskWriteAccess(id, userId);
  const parsed = updateTaskSchema.parse(input);

  const updates: Partial<typeof tasks.$inferInsert> = {
    updatedAt: new Date().toISOString(),
  };
  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.description !== undefined) updates.description = parsed.description;
  if (parsed.status !== undefined) updates.status = parsed.status;
  if (parsed.priority !== undefined) updates.priority = parsed.priority;
  if (parsed.assignee !== undefined) updates.assignee = parsed.assignee;
  if (parsed.dueDate !== undefined) updates.dueDate = parsed.dueDate;

  await db.update(tasks).set(updates).where(eq(tasks.id, id));

  await logActivity({
    userId,
    action: "task.updated",
    entityType: "task",
    entityId: id,
  });

  revalidateTask(existing.projectId);
  return { success: true as const };
}

export async function updateTaskStatus(
  taskId: string,
  input: UpdateTaskStatusInput
) {
  const userId = await requireUserId();
  const { taskId: id } = taskIdSchema.parse({ taskId });
  const existing = await verifyTaskWriteAccess(id, userId);
  const { status } = updateTaskStatusSchema.parse(input);

  await db
    .update(tasks)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));

  await logActivity({
    userId,
    action: "task.status_updated",
    entityType: "task",
    entityId: id,
  });

  // Completing work is the moment a client most wants to hear about.
  if (status === "done" && existing.projectId) {
    const [task] = await db
      .select({ title: tasks.title })
      .from(tasks)
      .where(eq(tasks.id, id))
      .limit(1);

    await notifyProjectClient(existing.projectId, {
      title: "Task completed",
      message: task?.title ?? "A task was completed",
      kind: "task",
      type: "task_completed",
    });
  }

  revalidateTask(existing.projectId);
  return { success: true as const, status };
}

// -- Delete / restore ---------------------------------------------------------

export async function softDeleteTask(taskId: string) {
  const userId = await requireUserId();
  const { taskId: id } = taskIdSchema.parse({ taskId });
  const existing = await verifyTaskWriteAccess(id, userId);

  const [task] = await db
    .select({ title: tasks.title })
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  const now = new Date().toISOString();
  await db
    .update(tasks)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(tasks.id, id));

  await logActivity({
    userId,
    action: "task.deleted",
    entityType: "task",
    entityId: id,
  });

  revalidateTask(existing.projectId);
  return { success: true as const, title: task?.title ?? "Task" };
}

export async function restoreTask(taskId: string) {
  const userId = await requireUserId();
  const { taskId: id } = taskIdSchema.parse({ taskId });

  const [task] = await db
    .select({ id: tasks.id, userId: tasks.userId, title: tasks.title, projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, id))
    .limit(1);

  if (!task) throw new Error("Task not found");
  if (task.userId !== userId) throw new Error("Forbidden");

  await db
    .update(tasks)
    .set({ deletedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(tasks.id, id));

  revalidateTask(task.projectId);
  return { success: true as const, title: task.title };
}

// -- Counts -------------------------------------------------------------------

/** Open work due inside the current week, for whoever is asking. */
export async function getTasksDueThisWeek() {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  const conditions = [isNull(tasks.deletedAt), eq(tasks.status, "todo")];

  if (role === "client") {
    const ids = await linkedClientIds(userId);
    if (ids.length === 0) return 0;
    conditions.push(
      inArray(
        tasks.projectId,
        db
          .select({ id: projects.id })
          .from(projects)
          .where(
            and(inArray(projects.clientId, ids), isNull(projects.deletedAt))
          )
      )
    );
  } else {
    conditions.push(eq(tasks.userId, userId));
  }

  const rows = await db
    .select({ dueDate: tasks.dueDate })
    .from(tasks)
    .where(and(...conditions));

  return rows.filter((row) => {
    if (!row.dueDate) return false;
    const due = new Date(row.dueDate);
    return due >= now && due <= endOfWeek;
  }).length;
}

export async function getTaskCount() {
  const userId = await requireUserId();
  const rows = await db
    .select({ id: tasks.id })
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)));
  return rows.length;
}
