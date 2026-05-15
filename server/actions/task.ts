"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { tasks, projects } from "@/db/schema";
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
} from "@/lib/validation";
import { logActivity } from "@/server/actions/activity";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

async function verifyProjectAccess(projectId: string, userId: string) {
  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");
  return project;
}

async function verifyTaskAccess(taskId: string, userId: string) {
  const [task] = await db
    .select({ userId: tasks.userId, projectId: tasks.projectId })
    .from(tasks)
    .where(and(eq(tasks.id, taskId), isNull(tasks.deletedAt)))
    .limit(1);

  if (!task) throw new Error("Task not found");
  if (task.userId !== userId) throw new Error("Forbidden");
  return task;
}

// -- Create Task ---------------------------------------------------------------

export async function createTask(input: CreateTaskInput) {
  const userId = await getUserId();
  const parsed = createTaskSchema.parse(input);

  if (parsed.projectId) {
    await verifyProjectAccess(parsed.projectId, userId);
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

  revalidatePath("/dashboard");
  if (parsed.projectId) {
    revalidatePath(`/dashboard/projects/${parsed.projectId}`);
  }
  return { success: true, taskId: id };
}

// -- Get Project Tasks ---------------------------------------------------------

export async function getProjectTasks(projectId: string) {
  const userId = await getUserId();
  await verifyProjectAccess(projectId, userId);

  return db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.projectId, projectId),
        isNull(tasks.deletedAt)
      )
    )
    .orderBy(desc(tasks.updatedAt));
}

// -- Update Task ---------------------------------------------------------------

export async function updateTask(taskId: string, input: UpdateTaskInput) {
  const userId = await getUserId();
  await verifyTaskAccess(taskId, userId);
  const parsed = updateTaskSchema.parse(input);

  const now = new Date().toISOString();

  await db
    .update(tasks)
    .set({
      title: parsed.title ?? undefined,
      description: parsed.description ?? undefined,
      status: parsed.status ?? undefined,
      priority: parsed.priority ?? undefined,
      assignee: parsed.assignee ?? undefined,
      dueDate: parsed.dueDate ?? undefined,
      updatedAt: now,
    })
    .where(eq(tasks.id, taskId));

  await logActivity({
    userId,
    action: "task.updated",
    entityType: "task",
    entityId: taskId,
  });

  const [task] = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  revalidatePath("/dashboard");
  if (task?.projectId) {
    revalidatePath(`/dashboard/projects/${task.projectId}`);
  }
  return { success: true };
}

// -- Update Task Status (drag & drop) ------------------------------------------

export async function updateTaskStatus(
  taskId: string,
  input: UpdateTaskStatusInput
) {
  const userId = await getUserId();
  await verifyTaskAccess(taskId, userId);
  const { status } = updateTaskStatusSchema.parse(input);

  const now = new Date().toISOString();

  await db
    .update(tasks)
    .set({ status, updatedAt: now })
    .where(eq(tasks.id, taskId));

  const [task] = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  revalidatePath("/dashboard");
  if (task?.projectId) {
    revalidatePath(`/dashboard/projects/${task.projectId}`);
  }
  return { success: true, status };
}

// -- Soft Delete Task ----------------------------------------------------------

export async function softDeleteTask(taskId: string) {
  const userId = await getUserId();
  await verifyTaskAccess(taskId, userId);

  const now = new Date().toISOString();
  await db
    .update(tasks)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(tasks.id, taskId));

  await logActivity({
    userId,
    action: "task.deleted",
    entityType: "task",
    entityId: taskId,
  });

  const [task] = await db
    .select({ projectId: tasks.projectId })
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  revalidatePath("/dashboard");
  if (task?.projectId) {
    revalidatePath(`/dashboard/projects/${task.projectId}`);
  }
  return { success: true };
}

// -- Counts (kept for dashboard) -----------------------------------------------

export async function getTasksDueThisWeek() {
  const userId = await getUserId();
  const now = new Date();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (7 - now.getDay()));

  const rows = await db
    .select()
    .from(tasks)
    .where(
      and(
        eq(tasks.userId, userId),
        isNull(tasks.deletedAt),
        eq(tasks.status, "todo")
      )
    );

  return rows.filter((t) => {
    if (!t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due >= now && due <= endOfWeek;
  }).length;
}

export async function getTaskCount() {
  const userId = await getUserId();
  const rows = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)));
  return rows.length;
}
