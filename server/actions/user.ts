"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { updateRoleSchema, type UpdateRoleInput } from "@/lib/validation";
import { logActivity } from "@/server/actions/activity";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

export async function getUserRole(): Promise<string | null> {
  const userId = await getUserId();

  const [user] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return user?.role ?? null;
}

export async function updateUserRole(input: UpdateRoleInput) {
  const userId = await getUserId();
  const { role } = updateRoleSchema.parse(input);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!existing) {
    const user = await currentUser();
    const email = user?.emailAddresses?.[0]?.emailAddress ?? `${userId}@user.lumenforge`;

    await db.insert(users).values({
      id: userId,
      email,
      role,
      name: user?.firstName
        ? `${user.firstName} ${user.lastName ?? ""}`.trim()
        : null,
      avatarUrl: user?.imageUrl ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    await db
      .update(users)
      .set({ role, updatedAt: new Date().toISOString() })
      .where(eq(users.id, userId));
  }

  await logActivity({
    userId,
    action: "role.updated",
    entityType: "user",
    entityId: userId,
  });

  revalidatePath("/dashboard");
  return { success: true, role };
}

export async function getDashboardData() {
  const userId = await getUserId();

  const [user] = await db
    .select({ role: users.role, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return {
    role: user?.role ?? "user",
    name: user?.name,
    email: user?.email,
  };
}
