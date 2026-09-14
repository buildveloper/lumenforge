import { redirect } from "next/navigation";

import { AppRail } from "@/components/app/app-rail";
import { MobileTabBar } from "@/components/app/mobile-tab-bar";
import { MotionProvider } from "@/components/app/motion-provider";
import { RouteSettle } from "@/components/app/route-settle";
import { TopBar } from "@/components/app/top-bar";
import { RoleSelector } from "@/components/onboarding/role-selector";
import { getNotifications, getUnreadCount } from "@/server/actions/notification";
import { getProjectOptions } from "@/server/actions/project";
import { getProfile } from "@/server/actions/user";
import { getUserId } from "@/server/helpers/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defence in depth: proxy.ts bounces anonymous visitors and every action
  // re-validates the session, but the layout must not render without one either.
  if (!(await getUserId())) redirect("/sign-in");

  const profile = await getProfile();
  const needsRole = profile.role === "user";

  const [projects, notifications, unreadCount] = needsRole
    ? [[], [], 0]
    : await Promise.all([
        getProjectOptions(),
        getNotifications(12),
        getUnreadCount(),
      ]);

  const name = profile.name ?? "Account";
  const email = profile.email ?? "";

  return (
    <MotionProvider features="app">
      <div className="flex min-h-screen">
        <AppRail role={profile.role} name={name} email={email} />
        <div className="flex min-w-0 flex-1 flex-col md:pl-60">
          <TopBar
            role={profile.role}
            projects={projects}
            notifications={notifications}
            unreadCount={unreadCount}
          />
          <main className="flex-1 pb-20 md:pb-0">
            <RouteSettle>{children}</RouteSettle>
          </main>
        </div>
      </div>

      <MobileTabBar role={profile.role} name={name} email={email} />

      {needsRole ? <RoleSelector /> : null}
    </MotionProvider>
  );
}
