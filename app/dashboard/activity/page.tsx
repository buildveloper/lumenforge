import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Activity, Bell, Briefcase, Receipt, CheckSquare, Sparkles, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getRecentActivity } from "@/server/actions/activity";
import { getNotifications, markAllAsRead } from "@/server/actions/notification";
import { ActivityClient } from "./activity-client";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  project: Briefcase,
  task: CheckSquare,
  invoice: Receipt,
  client: Users,
  ai: Sparkles,
  role: Users,
};

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [activities, notifications] = await Promise.all([
    getRecentActivity(30),
    getNotifications(30),
  ]);

  const feed = [
    ...notifications.map((n) => ({
      id: n.id,
      type: "notification",
      title: n.title,
      message: n.message,
      entityType: n.entityType ?? "",
      isRead: n.isRead,
      createdAt: n.createdAt,
    })),
    ...activities.map((a) => ({
      id: a.id,
      type: "activity",
      title: formatAction(a.action),
      message: `${a.entityType} #${a.entityId.slice(0, 8)}`,
      entityType: a.entityType,
      isRead: true,
      createdAt: a.createdAt,
    })),
  ].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Activity
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your recent notifications and activity.
          </p>
        </div>
        <ActivityClient />
      </div>

      {feed.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Activity className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1">No activity yet</h3>
            <p className="text-sm text-muted-foreground">
              Activity will appear as you create projects, tasks, and invoices.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {feed.map((item) => {
            const Icon = iconMap[item.entityType] ?? Bell;
            return (
              <div
                key={item.id}
                className={`flex items-start gap-4 px-4 py-3 rounded-lg transition-colors hover:bg-muted/30 ${
                  !item.isRead ? "bg-primary/5" : ""
                }`}
              >
                {!item.isRead && (
                  <div className="mt-2 h-2 w-2 rounded-full bg-primary shrink-0" />
                )}
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.message && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.message}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {getTimeAgo(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "role.updated": "Account role updated",
    "client.created": "New client added",
    "client.deleted": "Client removed",
    "project.created": "New project created",
    "project.updated": "Project updated",
    "project.deleted": "Project archived",
    "invoice.created": "Invoice created",
    "invoice.paid": "Invoice marked as paid",
    "invoice.sent": "Invoice sent",
    "task.created": "New task added",
    "task.updated": "Task updated",
    "task.deleted": "Task archived",
    "ai.generation": "AI content generated",
  };
  return map[action] ?? action.replace(/_/g, " ");
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
