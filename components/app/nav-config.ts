import {
  Activity,
  Briefcase,
  CheckSquare,
  LayoutDashboard,
  Receipt,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Roles that see this destination. Clients never see the client directory. */
  roles: Role[];
};

const ALL: Role[] = ["user", "freelancer", "admin"];
const EVERYONE: Role[] = ["user", "freelancer", "client", "admin"];

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, roles: EVERYONE },
  { href: "/dashboard/projects", label: "Projects", icon: Briefcase, roles: EVERYONE },
  { href: "/dashboard/invoices", label: "Invoices", icon: Receipt, roles: EVERYONE },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare, roles: ALL },
  { href: "/dashboard/clients", label: "Clients", icon: Users, roles: ALL },
  { href: "/dashboard/activity", label: "Activity", icon: Activity, roles: EVERYONE },
];

export function navItemsForRole(role: string | null | undefined): NavItem[] {
  const resolved = (role ?? "user") as Role;
  return NAV_ITEMS.filter((item) => item.roles.includes(resolved));
}

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** The four destinations that earn a slot in the mobile tab bar. */
export const MOBILE_TAB_HREFS = [
  "/dashboard",
  "/dashboard/projects",
  "/dashboard/invoices",
] as const;

export type CreateAction = {
  label: string;
  href: string;
  description: string;
};

/**
 * Creating happens on the page that owns the record, so the rail links there
 * with an intent flag instead of duplicating every dialog in the shell.
 */
export const CREATE_ACTIONS: CreateAction[] = [
  {
    label: "New project",
    href: "/dashboard/projects?new=1",
    description: "Track work, budget, and a deadline",
  },
  {
    label: "New invoice",
    href: "/dashboard/invoices?new=1",
    description: "Numbered automatically",
  },
  {
    label: "New client",
    href: "/dashboard/clients?new=1",
    description: "Contact details and company",
  },
  {
    label: "New task",
    href: "/dashboard/tasks?new=1",
    description: "Assign it to a project",
  },
];
