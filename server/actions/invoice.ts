"use server";

import { revalidatePath } from "next/cache";
import { and, count, desc, eq, inArray, isNull, or } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients, invoices, projects } from "@/db/schema";
import {
  createInvoiceSchema,
  invoiceIdSchema,
  paginationSchema,
  updateInvoiceSchema,
  updateInvoiceStatusSchema,
  type CreateInvoiceInput,
  type UpdateInvoiceInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { linkedClientIds } from "@/server/helpers/client-access";
import { notifyProjectClient } from "@/server/helpers/notify-project-client";
import { requireUserId, requireUserRole } from "@/server/helpers/session";

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"] as const;
type InvoiceStatus = (typeof STATUSES)[number];

function isStatus(value: string | undefined): value is InvoiceStatus {
  return value != null && (STATUSES as readonly string[]).includes(value);
}

/**
 * The visibility rule for invoices, resolved once per request.
 *
 * A client sees invoices addressed to a record they have claimed; previously
 * this compared `invoices.client_id` against the Clerk user id, which never
 * matched, so a client's invoice list was always empty.
 */
async function invoiceScope(): Promise<SQL> {
  const userId = await requireUserId();
  const role = await requireUserRole();

  if (role !== "client") return eq(invoices.userId, userId);

  const ids = await linkedClientIds(userId);
  return or(inArray(invoices.clientId, ids), eq(invoices.userId, userId))!;
}

const INVOICE_COLUMNS = {
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
  deletedAt: invoices.deletedAt,
};

function revalidateInvoices(invoiceId?: string, projectId?: string | null) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  if (invoiceId) revalidatePath(`/dashboard/invoices/${invoiceId}`);
  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  revalidatePath("/dashboard/activity");
}

async function verifyProjectWriteAccess(projectId: string, userId: string) {
  const [project] = await db
    .select({ userId: projects.userId })
    .from(projects)
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) throw new Error("Forbidden");
  return project;
}

// -- Numbering ----------------------------------------------------------------

/**
 * Every freelancer gets their own sequence, so their first invoice of the year
 * is INV-<year>-001 no matter what anyone else has issued. Derived from the
 * highest existing number rather than the most recent row, so deleting an
 * invoice never causes a number to be reused.
 */
async function nextInvoiceNumber(userId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;

  const rows = await db
    .select({ number: invoices.invoiceNumber })
    .from(invoices)
    .where(eq(invoices.userId, userId));

  let highest = 0;
  for (const row of rows) {
    if (!row.number.startsWith(prefix)) continue;
    const sequence = Number.parseInt(row.number.slice(prefix.length), 10);
    if (Number.isFinite(sequence) && sequence > highest) highest = sequence;
  }

  return `${prefix}${String(highest + 1).padStart(3, "0")}`;
}

// -- Create -------------------------------------------------------------------

export async function createInvoice(input: CreateInvoiceInput) {
  const userId = await requireUserId();
  const parsed = createInvoiceSchema.parse(input);

  if (parsed.projectId) {
    await verifyProjectWriteAccess(parsed.projectId, userId);
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  let invoiceNumber = "";

  // Two invoices created in the same instant can compute the same number; the
  // unique index rejects the loser and we take the next one.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    invoiceNumber = await nextInvoiceNumber(userId);
    try {
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
      break;
    } catch (error) {
      const uniqueViolation = String(error).includes("UNIQUE");
      if (!uniqueViolation || attempt === 4) throw error;
    }
  }

  await logActivity({
    userId,
    action: "invoice.created",
    entityType: "invoice",
    entityId: id,
  });

  if (parsed.projectId) {
    await notifyProjectClient(parsed.projectId, {
      title: "New invoice",
      message: `${invoiceNumber} is available in your portal`,
      kind: "invoice",
      type: "invoice_created",
    });
  }

  revalidateInvoices(undefined, parsed.projectId);
  return { success: true as const, invoiceId: id, invoiceNumber };
}

// -- Read ---------------------------------------------------------------------

export async function getUserInvoices(
  statusFilter?: string,
  pagination: { page?: number; limit?: number; clientId?: string } = {}
) {
  const { page, limit } = paginationSchema.parse(pagination);
  const offset = (page - 1) * limit;

  const base = and(isNull(invoices.deletedAt), await invoiceScope())!;

  const filters: SQL[] = [base];
  // "all" arrives from the filter pills; an unrecognised value means no filter
  // rather than a status that nothing can match.
  if (isStatus(statusFilter)) filters.push(eq(invoices.status, statusFilter));
  if (pagination.clientId) filters.push(eq(invoices.clientId, pagination.clientId));

  const filtered = and(...filters)!;

  const [rows, filteredCount, statusRows] = await Promise.all([
    db
      .select({
        ...INVOICE_COLUMNS,
        projectTitle: projects.title,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .leftJoin(clients, eq(invoices.clientId, clients.id))
      .where(filtered)
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(invoices).where(filtered),
    // Counts for the filter pills, so "Overdue 3" is real rather than implied.
    db.select({ status: invoices.status }).from(invoices).where(base),
  ]);

  const counts: Record<string, number> = { all: statusRows.length };
  for (const row of statusRows) {
    counts[row.status] = (counts[row.status] ?? 0) + 1;
  }

  const total = filteredCount[0]?.value ?? 0;

  return {
    invoices: rows,
    counts,
    total,
    page,
    limit,
    hasMore: offset + rows.length < total,
  };
}

export async function getInvoiceById(invoiceId: string) {
  const userId = await requireUserId();
  const role = await requireUserRole();
  const { invoiceId: id } = invoiceIdSchema.parse({ invoiceId });

  const [invoice] = await db
    .select({
      ...INVOICE_COLUMNS,
      projectTitle: projects.title,
      clientName: clients.name,
      clientEmail: clients.email,
      clientUserId: clients.clientUserId,
    })
    .from(invoices)
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");

  const isOwner = invoice.userId === userId;
  const isAddressedToCaller =
    role === "client" && invoice.clientUserId === userId;

  if (!isOwner && !isAddressedToCaller) throw new Error("Forbidden");

  return invoice;
}

export async function getProjectInvoices(projectId: string) {
  const userId = await requireUserId();
  const role = await requireUserRole();

  const [project] = await db
    .select({ userId: projects.userId, clientUserId: clients.clientUserId })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(and(eq(projects.id, projectId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) throw new Error("Project not found");

  const isOwner = project.userId === userId;
  const isClient = role === "client" && project.clientUserId === userId;
  if (!isOwner && !isClient) throw new Error("Forbidden");

  return db
    .select()
    .from(invoices)
    .where(and(eq(invoices.projectId, projectId), isNull(invoices.deletedAt)))
    .orderBy(desc(invoices.createdAt));
}

// -- Update -------------------------------------------------------------------

export async function updateInvoice(
  invoiceId: string,
  input: UpdateInvoiceInput
) {
  const userId = await requireUserId();
  const { invoiceId: id } = invoiceIdSchema.parse({ invoiceId });
  const parsed = updateInvoiceSchema.parse(input);

  const [invoice] = await db
    .select({
      userId: invoices.userId,
      projectId: invoices.projectId,
    })
    .from(invoices)
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();

  // Explicit nulls clear a field; absent keys leave it untouched. The previous
  // build used `?? undefined`, which made notes and due dates impossible to
  // clear once set.
  const updates: Partial<typeof invoices.$inferInsert> = { updatedAt: now };
  if (parsed.amount !== undefined) updates.amount = parsed.amount;
  if (parsed.notes !== undefined) updates.notes = parsed.notes;
  if (parsed.dueDate !== undefined) updates.dueDate = parsed.dueDate;
  if (parsed.status !== undefined) {
    updates.status = parsed.status;
    updates.paidAt = parsed.status === "paid" ? now : null;
  }

  await db.update(invoices).set(updates).where(eq(invoices.id, id));

  await logActivity({
    userId,
    action: "invoice.updated",
    entityType: "invoice",
    entityId: id,
  });

  revalidateInvoices(id, invoice.projectId);
  return { success: true as const };
}

export async function updateInvoiceStatus(invoiceId: string, input: unknown) {
  const userId = await requireUserId();
  const { invoiceId: id } = invoiceIdSchema.parse({ invoiceId });
  const parsed = updateInvoiceStatusSchema.parse(input);

  const [invoice] = await db
    .select({
      userId: invoices.userId,
      projectId: invoices.projectId,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
    })
    .from(invoices)
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();

  await db
    .update(invoices)
    .set({
      status: parsed.status,
      paidAt: parsed.status === "paid" ? now : null,
      updatedAt: now,
    })
    .where(eq(invoices.id, id));

  await logActivity({
    userId,
    action: `invoice.${parsed.status}`,
    entityType: "invoice",
    entityId: id,
  });

  if (parsed.status !== invoice.status && invoice.projectId) {
    await notifyProjectClient(invoice.projectId, {
      title:
        parsed.status === "paid"
          ? `${invoice.invoiceNumber} marked paid`
          : `${invoice.invoiceNumber} is now ${parsed.status}`,
      message: "The invoice status changed.",
      kind: "invoice",
      type: `invoice_${parsed.status}`,
    });
  }

  revalidateInvoices(id, invoice.projectId);
  return { success: true as const, status: parsed.status };
}

// -- Delete / restore ---------------------------------------------------------

export async function softDeleteInvoice(invoiceId: string) {
  const userId = await requireUserId();
  const { invoiceId: id } = invoiceIdSchema.parse({ invoiceId });

  const [invoice] = await db
    .select({
      userId: invoices.userId,
      projectId: invoices.projectId,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(invoices)
    .where(and(eq(invoices.id, id), isNull(invoices.deletedAt)))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();
  await db
    .update(invoices)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(invoices.id, id));

  await logActivity({
    userId,
    action: "invoice.deleted",
    entityType: "invoice",
    entityId: id,
  });

  revalidateInvoices(undefined, invoice.projectId);
  return { success: true as const, invoiceNumber: invoice.invoiceNumber };
}

export async function restoreInvoice(invoiceId: string) {
  const userId = await requireUserId();
  const { invoiceId: id } = invoiceIdSchema.parse({ invoiceId });

  const [invoice] = await db
    .select({
      userId: invoices.userId,
      projectId: invoices.projectId,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(invoices)
    .where(eq(invoices.id, id))
    .limit(1);

  if (!invoice) throw new Error("Invoice not found");
  if (invoice.userId !== userId) throw new Error("Forbidden");

  await db
    .update(invoices)
    .set({ deletedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(invoices.id, id));

  revalidateInvoices(id, invoice.projectId);
  return { success: true as const, invoiceNumber: invoice.invoiceNumber };
}

// -- Money --------------------------------------------------------------------

type MonthBucket = {
  label: string;
  year: number;
  month: number;
  invoiced: number;
  paid: number;
};

/**
 * Everything the overview needs about receivables in one pass: what is owed,
 * how much of it is late, and the last six months invoiced against collected.
 */
export async function getInvoiceSummary() {
  const base = and(isNull(invoices.deletedAt), await invoiceScope())!;

  const rows = await db
    .select({
      status: invoices.status,
      amount: invoices.amount,
      createdAt: invoices.createdAt,
      paidAt: invoices.paidAt,
    })
    .from(invoices)
    .where(base);

  const now = new Date();
  const buckets: MonthBucket[] = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const cursor = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    buckets.push({
      label: cursor.toLocaleDateString("en-US", { month: "short" }),
      year: cursor.getFullYear(),
      month: cursor.getMonth(),
      invoiced: 0,
      paid: 0,
    });
  }

  const bucketFor = (value: string | null) => {
    if (!value) return undefined;
    const date = new Date(`${value.replace(" ", "T")}Z`);
    return buckets.find(
      (bucket) =>
        bucket.year === date.getFullYear() && bucket.month === date.getMonth()
    );
  };

  let outstanding = 0;
  let overdue = 0;
  let draft = 0;
  let collected = 0;

  for (const row of rows) {
    if (row.status === "sent" || row.status === "overdue") outstanding += row.amount;
    if (row.status === "overdue") overdue += row.amount;
    if (row.status === "draft") draft += row.amount;
    if (row.status === "paid") collected += row.amount;

    const created = bucketFor(row.createdAt);
    if (created) created.invoiced += row.amount;

    const paid = bucketFor(row.paidAt);
    if (paid) paid.paid += row.amount;
  }

  return {
    outstanding,
    overdue,
    draft,
    collected,
    count: rows.length,
    months: buckets.map(({ label, invoiced, paid }) => ({ label, invoiced, paid })),
  };
}

export async function getOutstandingInvoiceAmount() {
  const base = and(isNull(invoices.deletedAt), await invoiceScope())!;

  const rows = await db
    .select({ status: invoices.status, amount: invoices.amount })
    .from(invoices)
    .where(base);

  return rows
    .filter((row) => row.status === "sent" || row.status === "overdue")
    .reduce((sum, row) => sum + row.amount, 0);
}

/** Late money, oldest first, for the overview's attention list. */
export async function getOverdueInvoices(limit = 10) {
  const base = and(isNull(invoices.deletedAt), await invoiceScope())!;

  return db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount,
      dueDate: invoices.dueDate,
      clientName: clients.name,
      projectTitle: projects.title,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .leftJoin(projects, eq(invoices.projectId, projects.id))
    .where(and(base, eq(invoices.status, "overdue")))
    .orderBy(invoices.dueDate)
    .limit(limit);
}

export async function getInvoiceCount() {
  const userId = await requireUserId();
  const [result] = await db
    .select({ value: count() })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)));
  return result?.value ?? 0;
}
