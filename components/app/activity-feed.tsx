import Link from "next/link";
import {
  Activity,
  Briefcase,
  Receipt,
  SquareCheck,
  UserRound,
  Users,
} from "lucide-react";

import { getActivityLabel } from "@/lib/status";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  project: Briefcase,
  task: SquareCheck,
  invoice: Receipt,
  client: Users,
  user: UserRound,
};

/** Falls back to the collection a record lives in, since we only store its id. */
function hrefFor(item: ActivityItem) {
  switch (item.entityType) {
    case "project":
      return `/dashboard/projects/${item.entityId}`;
    case "invoice":
      return `/dashboard/invoices/${item.entityId}`;
    case "client":
      return "/dashboard/clients";
    case "task":
      return "/dashboard/tasks";
    default:
      return null;
  }
}

export function ActivityFeed({
  items,
  className,
  dense = false,
}: {
  items: ActivityItem[];
  className?: string;
  dense?: boolean;
}) {
  return (
    <ul className={cn("flex flex-col", className)}>
      {items.map((item) => {
        const Icon = ICONS[item.entityType] ?? Activity;
        const href = hrefFor(item);
        const label = getActivityLabel(item.action);

        const body = (
          <>
            <span className="mt-px grid size-6 shrink-0 place-items-center rounded-sm border border-border bg-surface-sunken text-muted-foreground">
              <Icon className="size-3" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px]">{label}</span>
              <span className="block text-[11px] text-muted-foreground">
                {formatRelative(item.createdAt)}
              </span>
            </span>
          </>
        );

        return (
          <li key={item.id}>
            {href ? (
              <Link
                href={href}
                className={cn(
                  "flex items-start gap-2.5 rounded-md transition-colors hover:bg-surface-raised/50",
                  dense ? "px-2 py-2" : "px-2 py-2.5"
                )}
              >
                {body}
              </Link>
            ) : (
              <div
                className={cn(
                  "flex items-start gap-2.5",
                  dense ? "px-2 py-2" : "px-2 py-2.5"
                )}
              >
                {body}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
