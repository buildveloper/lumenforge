"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  getUnreadCount,
  markAllAsRead,
  markAsRead,
} from "@/server/actions/notification";

type NotificationRow = Awaited<ReturnType<typeof getNotifications>>[number];

/**
 * Notifications arrive with the server render, so the bell is correct on first
 * paint rather than empty-then-populated. The effect only polls, which keeps it
 * a genuine subscription to an external system.
 */
export function NotificationBell({
  initialItems,
  initialUnread,
}: {
  initialItems: NotificationRow[];
  initialUnread: number;
}) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initialItems);
  const [unread, setUnread] = useState(initialUnread);
  const router = useRouter();

  const refresh = useCallback(async () => {
    const [list, count] = await Promise.all([
      getNotifications(12),
      getUnreadCount(),
    ]);
    setItems(list);
    setUnread(count);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void refresh().catch(() => {
        // A dropped poll is not worth interrupting anyone over.
      });
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [refresh]);

  async function handleOpen(
    id: string,
    entityType: string | null,
    entityId: string | null
  ) {
    setOpen(false);
    await markAsRead(id);
    await refresh().catch(() => {});
    if (entityType === "project" && entityId) {
      router.push(`/dashboard/projects/${entityId}`);
    } else {
      router.push("/dashboard/activity");
    }
  }

  async function handleMarkAll() {
    await markAllAsRead();
    await refresh().catch(() => {});
    router.refresh();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
              }
              className="relative"
            >
              <Bell className="size-4" />
              {unread > 0 ? (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-signal ring-2 ring-background" />
              ) : null}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Activity</TooltipContent>
      </Tooltip>

      <PopoverContent align="end" className="w-[340px] p-0">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <span className="text-[13px] font-medium">Activity</span>
          {unread > 0 ? (
            <button
              type="button"
              onClick={handleMarkAll}
              className="text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              Mark all read
            </button>
          ) : null}
        </div>

        <div className="max-h-[360px] overflow-y-auto scroll-thin">
          {items.length === 0 ? (
            <p className="px-3.5 py-10 text-center text-[13px] text-muted-foreground">
              Nothing has happened yet. Creating a project, task, or invoice
              will show up here.
            </p>
          ) : (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() =>
                      handleOpen(item.id, item.entityType, item.entityId)
                    }
                    className={cn(
                      "flex w-full gap-2.5 border-b border-border/60 px-3.5 py-3 text-left transition-colors last:border-b-0 hover:bg-surface-raised/50",
                      !item.isRead && "bg-signal-subtle/40"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-1.5 size-1.5 shrink-0 rounded-full",
                        item.isRead ? "bg-transparent" : "bg-signal"
                      )}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">
                        {item.title}
                      </span>
                      {item.message ? (
                        <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                          {item.message}
                        </span>
                      ) : null}
                      <span className="mt-1 block text-[11px] text-muted-foreground">
                        {formatRelative(item.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-[12px]"
            asChild
          >
            <a href="/dashboard/activity" onClick={() => setOpen(false)}>
              View all activity
            </a>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
