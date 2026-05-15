import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { RoleSelector } from "@/components/onboarding/role-selector";
import { getDashboardData } from "@/server/actions/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let role = "user";
  try {
    const data = await getDashboardData();
    role = data.role;
  } catch (error) {
    console.error("[LumenForge] DashboardLayout getDashboardData failed:", error);
    // Continue with "user" role — the RoleSelector will appear
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={role} />
      <main className="flex-1 md:pl-64">
        <div className="pt-14 md:pt-0">
          {role === "user" && <RoleSelector />}
          {children}
        </div>
      </main>
    </div>
  );
}
