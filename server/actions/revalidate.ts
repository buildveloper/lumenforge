"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function revalidateDashboard() {
  await getUserId();
  revalidatePath("/dashboard");
}

export async function revalidateClients() {
  await getUserId();
  revalidatePath("/dashboard/clients");
}

export async function revalidateProjects() {
  await getUserId();
  revalidatePath("/dashboard/projects");
}

export async function revalidateInvoices() {
  await getUserId();
  revalidatePath("/dashboard/invoices");
}

export async function revalidateTasks() {
  await getUserId();
  revalidatePath("/dashboard/tasks");
}
