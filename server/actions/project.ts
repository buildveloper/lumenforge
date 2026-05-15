"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, desc, count, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { projects, clients } from "@/db/schema";
import {
  createProjectSchema,
  updateProjectSchema,
  deleteProjectSchema,
  paginationSchema,
  type CreateProjectInput,
  type UpdateProjectInput,
} from "@/lib/validation";
import { logActivity } from "@/server/actions/activity";
import { createNotification } from "@/server/actions/notification";
import { getUserRole } from "@/server/actions/user";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

// -- Create Project -----------------------------------------------------------

export async function createProject(input: CreateProjectInput) {
  const userId = await getUserId();
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
    message: `"${parsed.title}" has been created`,
    type: "project_created",
    entityType: "project",
    entityId: id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  return { success: true, projectId: id };
}

// -- Get User Projects (role-aware) -------------------------------------------

export async function getUserProjects(
  pagination: { page?: number; limit?: number } = {}
) {
  const userId = await getUserId();
  const role = await getUserRole();
  const { page, limit } = paginationSchema.parse(pagination);
  const offset = (page - 1) * limit;

  let whereClause;
  if (role === "freelancer") {
    whereClause = and(eq(projects.userId, userId), isNull(projects.deletedAt));
  } else if (role === "client") {
    whereClause = and(
      isNull(projects.deletedAt),
      or(
        eq(projects.clientId, userId),
        eq(projects.userId, userId)
      )
    );
  } else {
    whereClause = and(eq(projects.userId, userId), isNull(projects.deletedAt));
  }

  const [rows, totalResult] = await Promise.all([
    db
      .select({
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
        clientName: clients.name,
        clientCompany: clients.company,
      })
      .from(projects)
      .leftJoin(clients, eq(projects.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(projects.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(projects)
      .where(whereClause),
  ]);

  return {
    projects: rows,
    total: totalResult[0]?.value ?? 0,
    page,
    limit,
    hasMore: offset + rows.length < (totalResult[0]?.value ?? 0),
  };
}

// -- Get Project By ID --------------------------------------------------------

export async function getProjectById(projectId: string) {
  const userId = await getUserId();
  const role = await getUserRole();

  const [project] = await db
    .select({
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
      clientName: clients.name,
      clientCompany: clients.company,
      clientEmail: clients.email,
      clientUserId: clients.userId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const isOwner = project.userId === userId;
  const isClientUser =
    role === "client" && project.clientUserId === userId;

  if (!isOwner && !isClientUser) {
    throw new Error("Forbidden");
  }

  return project;
}

// -- Update Project -----------------------------------------------------------

export async function updateProject(
  projectId: string,
  input: UpdateProjectInput
) {
  const userId = await getUserId();
  const parsed = updateProjectSchema.parse(input);

  const [project] = await db
    .select({ id: projects.id, userId: projects.userId })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();

  await db
    .update(projects)
    .set({
      title: parsed.title ?? undefined,
      description: parsed.description ?? undefined,
      status: parsed.status ?? undefined,
      budget: parsed.budget ?? undefined,
      dueDate: parsed.dueDate ?? undefined,
      updatedAt: now,
    })
    .where(eq(projects.id, projectId));

  await logActivity({
    userId,
    action: "project.updated",
    entityType: "project",
    entityId: projectId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

// -- Soft Delete Project ------------------------------------------------------

export async function softDeleteProject(input: { projectId: string }) {
  const userId = await getUserId();
  const { projectId } = deleteProjectSchema.parse(input);

  const [project] = await db
    .select({ id: projects.id, userId: projects.userId })
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/projects");
  return { success: true };
}

// -- Counts -------------------------------------------------------------------

export async function getProjectCount() {
  const userId = await getUserId();
  const [result] = await db
    .select({ value: count() })
    .from(projects)
    .where(and(eq(projects.userId, userId), isNull(projects.deletedAt)));
  return result?.value ?? 0;
}

export async function getActiveProjectCount() {
  const userId = await getUserId();
  const [result] = await db
    .select({ value: count() })
    .from(projects)
    .where(
      and(
        eq(projects.userId, userId),
        isNull(projects.deletedAt),
        eq(projects.status, "active")
      )
    );
  return result?.value ?? 0;
}
