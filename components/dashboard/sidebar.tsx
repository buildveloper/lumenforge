"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Receipt,
  CheckSquare,
  Settings,
  Menu,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { cn } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

type SidebarProps = {
  role?: string | null;
};

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isFreelancer = role === "freelancer";
  const roleLabel = isFreelancer ? "Freelancer" : role === "client" ? "Client" : null;

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const bottomSection = (
    <div className="px-3">
      <Separator className="mb-4" />
      <div className="flex items-center justify-between gap-2 px-3 mb-3">
        <div className="flex items-center gap-3">
          <UserButton />
          <span className="text-sm text-muted-foreground">Account</span>
        </div>
        <NotificationBell />
      </div>
      {roleLabel && (
        <div className="px-3 mb-2">
          <Badge
            variant={isFreelancer ? "default" : "secondary"}
            className="w-full justify-center text-xs py-1"
          >
            {roleLabel}
          </Badge>
        </div>
      )}
      <div className="px-3">
        <Link
          href="/dashboard/help"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <HelpCircle className="h-4 w-4" />
          Help & Docs
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* -- Mobile trigger ------------------------------------------- */}
      <div className="fixed top-0 left-0 z-40 flex h-14 items-center gap-2 border-b border-border/40 bg-background/95 backdrop-blur px-4 md:hidden w-full">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center gap-2 border-b border-border/40 px-4">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight">
                LumenForge
              </span>
            </div>
            <div className="flex flex-col justify-between flex-1 py-4">
              <NavLinks />
              {bottomSection}
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            LumenForge
          </span>
        </Link>
      </div>

      {/* -- Desktop sidebar ------------------------------------------ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-border/40 bg-background md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-border/40 px-6">
          <Briefcase className="h-5 w-5 text-primary" />
          <span className="text-lg font-semibold tracking-tight">
            LumenForge
          </span>
        </div>
        <div className="flex flex-col justify-between flex-1 py-4">
          <NavLinks />
          {bottomSection}
        </div>
      </aside>
    </>
  );
}
