"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { Breadcrumbs, breadcrumbsForPath } from "@/components/app/breadcrumbs";
import { CommandMenu, type ProjectOption } from "@/components/app/command-menu";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { TooltipProvider } from "@/components/ui/tooltip";

export function TopBar({
  role,
  projects,
  notifications,
  unreadCount,
}: {
  role: string;
  projects: ProjectOption[];
  notifications: React.ComponentProps<typeof NotificationBell>["initialItems"];
  unreadCount: number;
}) {
  const pathname = usePathname();
  const crumbs = breadcrumbsForPath(pathname);

  return (
    <TooltipProvider delayDuration={300}>
      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-6">
        <Link href="/dashboard" className="shrink-0 rounded-sm md:hidden">
          <Logo wordmarkClassName="text-[14px]" />
        </Link>

        <div className="hidden min-w-0 flex-1 md:block">
          <Breadcrumbs items={crumbs} />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1">
          <CommandMenu role={role} projects={projects} />
          <ThemeToggle />
          <NotificationBell
            initialItems={notifications}
            initialUnread={unreadCount}
          />
        </div>
      </header>
    </TooltipProvider>
  );
}
