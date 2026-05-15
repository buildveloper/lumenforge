"use server";

import { revalidatePath } from "next/cache";

export async function revalidateDashboard() {
  revalidatePath("/dashboard");
}

export async function revalidateClients() {
  revalidatePath("/dashboard/clients");
}

export async function revalidateProjects() {
  revalidatePath("/dashboard/projects");
}

export async function revalidateInvoices() {
  revalidatePath("/dashboard/invoices");
}

export async function revalidateTasks() {
  revalidatePath("/dashboard/tasks");
}
