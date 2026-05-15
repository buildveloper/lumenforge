"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { getNotifications, markAsRead, markAllAsRead, getUnreadCount } from "@/server/actions/notification";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  async function load() {
    const [data, count] = await Promise.all([
      getNotifications(10),
      getUnreadCount(),
    ]);
    setNotifications(data);
    setUnread(count);
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleClick(notification: any) {
    if (!notification.isRead) {
      await markAsRead(notification.id);
      load();
    }
    if (notification.entityId && notification.entityType === "project") {
      router.push(`/dashboard/projects/${notification.entityId}`);
    }
    setOpen(false);
  }

  async function handleMarkAll() {
    await markAllAsRead();
    load();
  }

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
          <h4 className="text-sm font-semibold">Notifications</h4>
          {unread > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-xs text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No notifications yet
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border/20 last:border-b-0 ${
                  !n.isRead ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  {!n.isRead && (
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{n.title}</p>
                    {n.message && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {n.message}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
        <Separator />
        <div className="p-2">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard/activity");
            }}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            View all activity
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
