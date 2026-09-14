"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { m } from "motion/react";
import { Plus } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/app/account-menu";
import { CREATE_ACTIONS, isActivePath, navItemsForRole } from "@/components/app/nav-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 400, damping: 32 };

function NewMenu() {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-8 w-full items-center gap-2 rounded-md bg-primary px-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-88">
        <Plus className="size-3.5" />
        New
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {CREATE_ACTIONS.map((action) => (
          <DropdownMenuItem
            key={action.href}
            onSelect={() => router.push(action.href)}
            className="flex-col items-start gap-0.5 py-2"
          >
            <span className="text-[13px] font-medium">{action.label}</span>
            <span className="text-[11px] text-muted-foreground">
              {action.description}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The rail's active state glides between items with a shared layout animation
 * rather than snapping a background on and off.
 */
export function AppRail({ role }: { role: string }) {
  const pathname = usePathname();
  const items = navItemsForRole(role);
  const canCreate = role === "freelancer" || role === "user" || role === "admin";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-border bg-card md:flex">
      <div className="flex h-14 shrink-0 items-center px-4">
        <Link href="/dashboard" className="rounded-sm">
          <Logo />
        </Link>
      </div>

      {canCreate ? (
        <div className="px-3 pb-3">
          <NewMenu />
        </div>
      ) : null}

      <nav aria-label="Workspace" className="flex flex-1 flex-col gap-0.5 px-3 py-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "text-signal"
                  : "text-muted-foreground hover:bg-surface-raised/60 hover:text-foreground"
              )}
            >
              {active ? (
                <m.span
                  layoutId="rail-active"
                  className="absolute inset-0 rounded-md bg-signal-subtle"
                  transition={spring}
                />
              ) : null}
              <item.icon className="relative size-4 shrink-0" />
              <span className="relative truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border p-2">
        <AccountMenu />
      </div>
    </aside>
  );
}
