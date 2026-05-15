"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, and, isNull, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { clients } from "@/db/schema";
import {
  createClientSchema,
  deleteClientSchema,
  paginationSchema,
  type CreateClientInput,
} from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function createClient(input: CreateClientInput) {
  const userId = await getUserId();
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return { success: true, clientId: id };
}

export async function getClients(pagination: { page?: number; limit?: number } = {}) {
  const userId = await getUserId();
  const { page, limit } = paginationSchema.parse(pagination);
  const offset = (page - 1) * limit;

  const [rows, totalResult] = await Promise.all([
    db
      .select()
      .from(clients)
      .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)))
      .orderBy(desc(clients.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ value: count() })
      .from(clients)
      .where(and(eq(clients.userId, userId), isNull(clients.deletedAt))),
  ]);

  return {
    clients: rows,
    total: totalResult[0]?.value ?? 0,
    page,
    limit,
    hasMore: offset + rows.length < (totalResult[0]?.value ?? 0),
  };
}

export async function getClientCount() {
  const userId = await getUserId();
  const [result] = await db
    .select({ value: count() })
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)));
  return result?.value ?? 0;
}

export async function softDeleteClient(input: { clientId: string }) {
  const userId = await getUserId();
  const { clientId } = deleteClientSchema.parse(input);

  const [client] = await db
    .select({ id: clients.id, userId: clients.userId })
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

  await logActivity({ userId, action: "client.deleted", entityType: "client", entityId: clientId });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/clients");
  return { success: true };
}
