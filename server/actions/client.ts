"use server";

import { revalidatePath } from "next/cache";
import { and, asc, count, eq, isNull, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { clients, invoices, projects, users } from "@/db/schema";
import {
  clientIdSchema,
  createClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type UpdateClientInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { claimClientRecords, linkedClientIds } from "@/server/helpers/client-access";
import { requireUserId } from "@/server/helpers/session";

function revalidateClients() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
}

export async function createClient(input: CreateClientInput) {
  const userId = await requireUserId();
  const parsed = createClientSchema.parse(input);
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(clients).values({
    id,
    userId,
    name: parsed.name,
    email: parsed.email ?? null,
    company: parsed.company ?? null,
    phone: parsed.phone ?? null,
    notes: parsed.notes ?? null,
    createdAt: now,
    updatedAt: now,
  });

  await logActivity({
    userId,
    action: "client.created",
    entityType: "client",
    entityId: id,
  });

  revalidateClients();
  return { success: true as const, clientId: id, name: parsed.name };
}

/**
 * The client directory: contact details plus the two numbers that make the list
 * worth scanning, open work and money still owed.
 */
export async function getClientRecords() {
  const userId = await requireUserId();

  const [rows, projectRows, invoiceRows] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)))
      .orderBy(asc(clients.name)),
    db
      .select({
        clientId: projects.clientId,
        status: projects.status,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .where(and(eq(projects.userId, userId), isNull(projects.deletedAt))),
    db
      .select({
        clientId: invoices.clientId,
        status: invoices.status,
        amount: invoices.amount,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt))),
  ]);

  return rows.map((client) => {
    const clientProjects = projectRows.filter((p) => p.clientId === client.id);
    const clientInvoices = invoiceRows.filter((i) => i.clientId === client.id);

    return {
      ...client,
      openProjects: clientProjects.filter(
        (p) => p.status === "active" || p.status === "on_hold"
      ).length,
      totalProjects: clientProjects.length,
      outstanding: clientInvoices
        .filter((i) => i.status === "sent" || i.status === "overdue")
        .reduce((sum, i) => sum + i.amount, 0),
      lastActivityAt: [...clientProjects, ...clientInvoices]
        .map((row) => row.updatedAt)
        .sort()
        .at(-1) ?? client.updatedAt,
    };
  });
}

export async function getClientOptions() {
  const userId = await requireUserId();
  return db
    .select({ id: clients.id, name: clients.name, company: clients.company })
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)))
    .orderBy(asc(clients.name));
}

export async function getClientCount() {
  const userId = await requireUserId();
  const [result] = await db
    .select({ value: count() })
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)));
  return result?.value ?? 0;
}

export async function updateClient(input: {
  clientId: string;
  values: UpdateClientInput;
}) {
  const userId = await requireUserId();
  const { clientId } = clientIdSchema.parse({ clientId: input.clientId });
  const parsed = updateClientSchema.parse(input.values);

  const [existing] = await db
    .select({ id: clients.id, userId: clients.userId })
    .from(clients)
    .where(and(eq(clients.id, clientId), isNull(clients.deletedAt)))
    .limit(1);

  if (!existing) throw new Error("Client not found");
  if (existing.userId !== userId) throw new Error("Forbidden");

  await db
    .update(clients)
    .set({
      name: parsed.name,
      email: parsed.email,
      company: parsed.company,
      phone: parsed.phone,
      notes: parsed.notes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(clients.id, clientId));

  await logActivity({
    userId,
    action: "client.updated",
    entityType: "client",
    entityId: clientId,
  });

  revalidateClients();
  return { success: true as const };
}

export async function softDeleteClient(input: { clientId: string }) {
  const userId = await requireUserId();
  const { clientId } = clientIdSchema.parse(input);

  const [client] = await db
    .select({ id: clients.id, userId: clients.userId, name: clients.name })
    .from(clients)
    .where(and(eq(clients.id, clientId), isNull(clients.deletedAt)))
    .limit(1);

  if (!client) throw new Error("Client not found");
  if (client.userId !== userId) throw new Error("Forbidden");

  const now = new Date().toISOString();
  await db
    .update(clients)
    .set({ deletedAt: now, updatedAt: now })
    .where(eq(clients.id, clientId));

  await logActivity({
    userId,
    action: "client.deleted",
    entityType: "client",
    entityId: clientId,
  });

  revalidateClients();
  return { success: true as const, name: client.name };
}

/** Undo for a soft delete. Everything in this product is restorable. */
export async function restoreClient(input: { clientId: string }) {
  const userId = await requireUserId();
  const { clientId } = clientIdSchema.parse(input);

  const [client] = await db
    .select({ id: clients.id, userId: clients.userId, name: clients.name })
    .from(clients)
    .where(eq(clients.id, clientId))
    .limit(1);

  if (!client) throw new Error("Client not found");
  if (client.userId !== userId) throw new Error("Forbidden");

  await db
    .update(clients)
    .set({ deletedAt: null, updatedAt: new Date().toISOString() })
    .where(eq(clients.id, clientId));

  revalidateClients();
  return { success: true as const, name: client.name };
}

/**
 * Called when someone takes the client role. Finds any client records that
 * already carry their email address and links them, which is what gives a
 * client something to see on first sign-in.
 */
export async function claimClientRecordsForCurrentUser() {
  const userId = await requireUserId();

  const [account] = await db
    .select({ email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!account?.email) return { success: false as const, claimed: 0 };

  const claimed = await claimClientRecords(userId, account.email);
  if (claimed > 0) revalidatePath("/dashboard");

  return { success: true as const, claimed };
}

/** How many client records this user is linked to, for the portal empty state. */
export async function getLinkedClientCount() {
  const userId = await requireUserId();
  const ids = await linkedClientIds(userId);
  if (ids.length === 0) return 0;

  const [result] = await db
    .select({ value: count() })
    .from(clients)
    .where(and(inArray(clients.id, ids), isNull(clients.deletedAt)));

  return result?.value ?? 0;
}

/** The freelancer(s) this client is working with, for the portal header. */
export async function getClientCounterparties() {
  const userId = await requireUserId();
  const ids = await linkedClientIds(userId);
  if (ids.length === 0) return [];

  return db
    .selectDistinct({ id: users.id, name: users.name, email: users.email })
    .from(clients)
    .innerJoin(users, eq(clients.userId, users.id))
    .where(and(inArray(clients.id, ids), isNull(clients.deletedAt)));
}
