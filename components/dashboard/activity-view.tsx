"use client";

import { useMemo, useState } from "react";

import { ActivityFeed, type ActivityItem } from "@/components/app/activity-feed";
import { EmptyState } from "@/components/app/empty-state";
import { Segmented } from "@/components/app/segmented";
import { Activity } from "lucide-react";
import { formatDateLong } from "@/lib/format";

type Filter = "all" | "project" | "task" | "invoice" | "client";

function dayLabel(value: string) {
  const date = new Date(`${value.replace(" ", "T")}Z`);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const same = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";
  return formatDateLong(value);
}

/**
 * A grouped timeline rather than a flat list. Activity is the audit trail of
 * everything that changed; notifications are the separate "this needs you"
 * channel, and merging the two used to show the same event twice.
 */
export function ActivityView({ items }: { items: ActivityItem[] }) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(
    () =>
      items.reduce<Record<string, number>>((acc, item) => {
        acc[item.entityType] = (acc[item.entityType] ?? 0) + 1;
        return acc;
      }, {}),
    [items]
  );

  const groups = useMemo(() => {
    const filtered =
      filter === "all" ? items : items.filter((item) => item.entityType === filter);

    const buckets = new Map<string, ActivityItem[]>();
    for (const item of filtered) {
      const label = dayLabel(item.createdAt);
      const bucket = buckets.get(label);
      if (bucket) bucket.push(item);
      else buckets.set(label, [item]);
    }
    return [...buckets.entries()];
  }, [items, filter]);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Nothing logged yet"
        description="Creating a project, moving a task, or sending an invoice writes an entry here with a timestamp. Nothing is ever removed from this list."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Segmented
        id="activity"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "all", label: "Everything", count: items.length },
          { value: "project", label: "Projects", count: counts.project ?? 0 },
          { value: "task", label: "Tasks", count: counts.task ?? 0 },
          { value: "invoice", label: "Invoices", count: counts.invoice ?? 0 },
          { value: "client", label: "Clients", count: counts.client ?? 0 },
        ]}
      />

      {groups.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface-sunken/40 px-4 py-8 text-center text-[13px] text-muted-foreground">
          Nothing in this category yet.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map(([label, entries]) => (
            <section key={label}>
              <h2 className="mb-1.5 text-[11px] font-medium text-muted-foreground">
                {label}
              </h2>
              <div className="rounded-lg border border-border bg-card p-1.5">
                <ActivityFeed items={entries} dense />
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
