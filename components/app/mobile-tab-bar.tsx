"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { m } from "motion/react";
import { Menu } from "lucide-react";

import { AccountMenu } from "@/components/app/account-menu";
import { isActivePath, MOBILE_TAB_HREFS, navItemsForRole } from "@/components/app/nav-config";
import { Logo } from "@/components/brand/logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 400, damping: 32 };

/**
 * Primary destinations live in the bottom 25% of the screen, inside one-handed
 * reach. Everything else moves into the sheet behind "More".
 */
export function MobileTabBar({
  role,
  name,
  email,
}: {
  role: string;
  name: string;
  email: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const allItems = navItemsForRole(role);
  const tabItems = MOBILE_TAB_HREFS.map(
    (href) => allItems.find((item) => item.href === href)!
  ).filter(Boolean);
  const overflowItems = allItems.filter(
    (item) => !MOBILE_TAB_HREFS.includes(item.href as (typeof MOBILE_TAB_HREFS)[number])
  );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-stretch border-t border-border bg-background/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {tabItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
              active ? "text-signal" : "text-muted-foreground"
            )}
          >
            {active ? (
              <m.span
                layoutId="tab-active"
                className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-signal"
                transition={spring}
              />
            ) : null}
            <item.icon className="size-[18px]" />
            {item.label}
          </Link>
        );
      })}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          aria-label="More destinations"
          className={cn(
            "relative flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
            open ? "text-signal" : "text-muted-foreground"
          )}
        >
          <Menu className="size-[18px]" />
          More
        </SheetTrigger>

        <SheetContent side="bottom" className="px-0 pb-6">
          <SheetHeader className="pb-2">
            <Logo />
            <SheetTitle className="sr-only">All destinations</SheetTitle>
          </SheetHeader>

          <div className="flex flex-col gap-0.5 px-3">
            {overflowItems.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-[14px] font-medium transition-colors",
                    active
                      ? "bg-signal-subtle text-signal"
                      : "text-muted-foreground hover:bg-surface-raised/60 hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Separator className="my-3" />

          <div className="px-3">
            <Button variant="outline" className="w-full" asChild>
              <Link href="/settings" onClick={() => setOpen(false)}>
                Account settings
              </Link>
            </Button>
          </div>

          <div className="mt-4 px-3">
            <AccountMenu name={name} email={email} />
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
}
