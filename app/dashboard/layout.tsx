import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { AppRail } from "@/components/app/app-rail";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { MotionProvider } from "@/components/app/motion-provider";
import { RouteSettle } from "@/components/app/route-settle";
import { TopBar } from "@/components/app/top-bar";
import { RoleSelector } from "@/components/onboarding/role-selector";
import { getNotifications, getUnreadCount } from "@/server/actions/notification";
import { getProjectOptions } from "@/server/actions/project";
import { getDashboardData } from "@/server/actions/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Deliberately not caught: if the user row can't be read we must fail loudly.
  // Swallowing it fell back to role "user", which showed the role picker to
  // existing accounts and let them silently overwrite their own role.
  const { role } = await getDashboardData();
  const needsRole = role === "user";

  const [projects, notifications, unreadCount] = needsRole
    ? [[], [], 0]
    : await Promise.all([
        getProjectOptions(),
        getNotifications(12),
        getUnreadCount(),
      ]);

  return (
    <MotionProvider features="app">
      <div className="flex min-h-screen">
        <AppRail role={role} />
        <div className="flex min-w-0 flex-1 flex-col md:pl-60">
          <TopBar
            role={role}
            projects={projects}
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <main className="flex-1 pb-20 md:pb-0">
            <RouteSettle>{children}</RouteSettle>
          </main>
        </div>
      </div>

      <MobileTabBar role={role} />

      {needsRole ? <RoleSelector /> : null}
    </MotionProvider>
  );
}
