"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, and, desc, count, sql, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { invoices, projects, clients } from "@/db/schema";
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  paginationSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { getUserRole } from "@/server/actions/user";

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

// -- Generate Invoice Number ---------------------------------------------------

async function generateInvoiceNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const [last] = await db
    .select({ number: invoices.invoiceNumber })
    .from(invoices)
    .where(isNull(invoices.deletedAt))
    .orderBy(desc(invoices.createdAt))
    .limit(1);

  let seq = 1;
  if (last?.number) {
    const match = last.number.match(/INV-\d{4}-(\d{3})/);
    if (match) seq = parseInt(match[1]) + 1;
  }

  return `INV-${year}-${String(seq).padStart(3, "0")}`;
}

// -- Create Invoice ------------------------------------------------------------

export async function createInvoice(input: CreateInvoiceInput) {
  const userId = await getUserId();
  const parsed = createInvoiceSchema.parse(input);

  if (parsed.projectId) {
    await verifyProjectAccess(parsed.projectId, userId);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const invoiceNumber = await generateInvoiceNumber();

  await db.insert(invoices).values({
    id,
    userId,
    clientId: parsed.clientId ?? null,
    projectId: parsed.projectId ?? null,
    invoiceNumber,
    status: parsed.status,
    amount: parsed.amount,
    notes: parsed.notes ?? null,
    dueDate: parsed.dueDate ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity({
    userId,
    action: "invoice.created",
    entityType: "invoice",
    entityId: id,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  if (parsed.projectId) {
    revalidatePath(`/dashboard/projects/${parsed.projectId}`);
  }
  return { success: true, invoiceId: id, invoiceNumber };
}

// -- Get User Invoices (role-aware) --------------------------------------------

export async function getUserInvoices(
  statusFilter?: string,
  pagination: { page?: number; limit?: number } = {}
) {
  const userId = await getUserId();
  const role = await getUserRole();
  const { page, limit } = paginationSchema.parse(pagination);
  const offset = (page - 1) * limit;

  let conditions = [];
  conditions.push(isNull(invoices.deletedAt));
  if (role === "freelancer" || role === "user") {
    conditions.push(eq(invoices.userId, userId));
  } else if (role === "client") {
    conditions.push(eq(invoices.clientId, userId));
  } else {
    conditions.push(eq(invoices.userId, userId));
  }

  if (statusFilter) {
    conditions.push(
      eq(invoices.status, statusFilter as "draft" | "sent" | "paid" | "overdue" | "cancelled")
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalResult] = await Promise.all([
    db
      .select({
        id: invoices.id,
        userId: invoices.userId,
        clientId: invoices.clientId,
        projectId: invoices.projectId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        amount: invoices.amount,
        notes: invoices.notes,
        dueDate: invoices.dueDate,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
        projectTitle: projects.title,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(whereClause)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(invoices)
      .where(whereClause ?? undefined),
  ]);

  return {
    invoices: rows,
    total: totalResult[0]?.value ?? 0,
    page,
    limit,
    hasMore: offset + rows.length < (totalResult[0]?.value ?? 0),
  };
}

// -- Get Invoice By ID ---------------------------------------------------------

export async function getInvoiceById(invoiceId: string) {
  const userId = await getUserId();

  const [invoice] = await db
    .select({
      id: invoices.id,
      userId: invoices.userId,
      clientId: invoices.clientId,
      projectId: invoices.projectId,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      amount: invoices.amount,
      notes: invoices.notes,
      dueDate: invoices.dueDate,
      paidAt: invoices.paidAt,
      createdAt: invoices.createdAt,
      updatedAt: invoices.updatedAt,
      projectTitle: projects.title,
      clientName: clients.name,
      clientEmail: clients.email,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  return invoice;
}

// -- Update Invoice ------------------------------------------------------------

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput
) {
  const userId = await getUserId();
  const parsed = updateInvoiceSchema.parse(input);

  const [invoice] = await db
    .select({ userId: invoices.userId, projectId: invoices.projectId })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();

  await db
    .update(invoices)
    .set({
      amount: parsed.amount ?? undefined,
      notes: parsed.notes ?? undefined,
      dueDate: parsed.dueDate ?? undefined,
      status: parsed.status ?? undefined,
      paidAt: parsed.status === "paid" ? now : undefined,
      updatedAt: now,
    })
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

  await logActivity({
    userId,
    action: "invoice.updated",
    entityType: "invoice",
    entityId: invoiceId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  if (invoice.projectId) {
    revalidatePath(`/dashboard/projects/${invoice.projectId}`);
  }
  return { success: true };
}

// -- Update Invoice Status -----------------------------------------------------

export async function updateInvoiceStatus(
  invoiceId: string,
  input: { status: string }
) {
  const userId = await getUserId();
  const parsed = updateInvoiceStatusSchema.parse(input);

  const [invoice] = await db
    .select({ userId: invoices.userId, projectId: invoices.projectId })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();

  await db
    .update(invoices)
    .set({
      status: parsed.status,
      paidAt: parsed.status === "paid" ? now : undefined,
      updatedAt: now,
    })
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)));

  await logActivity({
    userId,
    action: `invoice.${parsed.status}`,
    entityType: "invoice",
    entityId: invoiceId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidatePath(`/dashboard/invoices/${invoiceId}`);
  if (invoice.projectId) {
    revalidatePath(`/dashboard/projects/${invoice.projectId}`);
  }
  return { success: true };
}

// -- Get Project Invoices ------------------------------------------------------

export async function getProjectInvoices(projectId: string) {
  const userId = await getUserId();
  await verifyProjectAccess(projectId, userId);

  return db
    .select()
    .from(invoices)
    .where(and(eq(invoices.projectId, projectId), isNull(invoices.deletedAt)))
    .orderBy(desc(invoices.createdAt));
}

// -- Soft Delete Invoice ------------------------------------------------------

export async function softDeleteInvoice(invoiceId: string) {
  const userId = await getUserId();

  const [invoice] = await db
    .select({ userId: invoices.userId, projectId: invoices.projectId })
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();
  await db
    .update(invoices)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(invoices.id, invoiceId));

  await logActivity({
    userId,
    action: "invoice.deleted",
    entityType: "invoice",
    entityId: invoiceId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  if (invoice.projectId) {
    revalidatePath(`/dashboard/projects/${invoice.projectId}`);
  }
  return { success: true };
}

// -- Counts (for dashboard) ----------------------------------------------------

export async function getOutstandingInvoiceAmount() {
  const userId = await getUserId();
  const rows = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)));

  return rows
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((sum, i) => sum + i.amount, 0);
}

export async function getInvoiceCount() {
  const userId = await getUserId();
  const [result] = await db
    .select({ value: count() })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)));
  return result?.value ?? 0;
}
