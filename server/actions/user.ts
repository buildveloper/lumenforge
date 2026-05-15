"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { updateRoleSchema, type UpdateRoleInput } from "@/lib/validation";
import { logActivity } from "@/server/helpers/log-activity";
import { revalidatePath } from "next/cache";

async function getUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  return userId;
}

async function ensureUserExists(userId: string): Promise<void> {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existing) return;

  try {
    const clerkUser = await currentUser();
    const email =
      clerkUser?.emailAddresses?.[0]?.emailAddress ??
      `${userId}@user.lumenforge`;
    const name = clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName ?? ""}`.trim()
      : null;

    await db.insert(users).values({
      id: userId,
      email,
      role: "user",
      name,
      avatarUrl: clerkUser?.imageUrl ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    console.log(`[LumenForge] Created new user record for: ${email}`);
  } catch (error) {
    console.error("[LumenForge] Failed to create user record:", error);
    // Don't throw — let the app continue with the role selector
  }
}

export async function getUserRole(): Promise<string | null> {
  const userId = await getUserId();
  await ensureUserExists(userId);

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

  await ensureUserExists(userId);

  await db
    .update(users)
    .set({ role, updatedAt: new Date().toISOString() })
    .where(eq(users.id, userId));

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

  try {
    await ensureUserExists(userId);

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
  } catch (error) {
    console.error("[LumenForge] getDashboardData failed:", error);
    return { role: "user", name: null, email: null };
  }
}
