import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Briefcase,
  DollarSign,
  CheckSquare,
  Users,
  Activity,
  ArrowRight,
  Clock,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardClient } from "./dashboard-client";

import { getDashboardData } from "@/server/actions/user";
import { getActiveProjectCount, getUserProjects } from "@/server/actions/project";
import { getOutstandingInvoiceAmount } from "@/server/actions/invoice";
import { getTasksDueThisWeek } from "@/server/actions/task";
import { getClientCount } from "@/server/actions/client";
import { getRecentActivity } from "@/server/actions/activity";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const firstName =
    user?.firstName ??
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ??
    "there";

  const [
    { role },
    activeProjects,
    outstandingAmount,
    tasksDueThisWeek,
    clientCount,
    recentActivity,
    { projects: recentProjects },
  ] = await Promise.all([
    getDashboardData(),
    getActiveProjectCount(),
    getOutstandingInvoiceAmount(),
    getTasksDueThisWeek(),
    getClientCount(),
    getRecentActivity(8),
    getUserProjects({ page: 1, limit: 5 }),
  ]);

  const isFreelancer = role === "freelancer";
  const skipRole = role === "user";

  if (skipRole) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* -- Welcome header --------------------------------------- */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isFreelancer
              ? "Here's your business at a glance."
              : "Here's an overview of your projects."}
          </p>
        </div>
        <DashboardClient />
      </div>

      {/* -- Stats row -------------------------------------------- */}
      {isFreelancer ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={Briefcase}
            iconClass="text-primary"
          />
          <StatCard
            label="Outstanding Invoices"
            value={`$${(outstandingAmount / 100).toLocaleString()}`}
            icon={DollarSign}
            iconClass="text-warning"
          />
          <StatCard
            label="Tasks Due This Week"
            value={tasksDueThisWeek}
            icon={CheckSquare}
            iconClass="text-primary"
          />
          <StatCard
            label="Total Clients"
            value={clientCount}
            icon={Users}
            iconClass="text-primary"
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="Active Projects"
            value={activeProjects}
            icon={Briefcase}
            iconClass="text-primary"
          />
          <StatCard
            label="Pending Invoices"
            value={clientCount}
            icon={FileText}
            iconClass="text-warning"
          />
          <StatCard
            label="Recent Updates"
            value={recentActivity.length}
            icon={Activity}
            iconClass="text-primary"
          />
          <StatCard
            label="Next Deadline"
            value={tasksDueThisWeek > 0 ? `${tasksDueThisWeek} tasks` : "None"}
            icon={Clock}
            iconClass="text-primary"
          />
        </div>
      )}

      {/* -- Two-column layout ------------------------------------ */}
      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {isFreelancer ? "Recent Projects" : "Your Projects"}
            </h2>
            <Button variant="ghost" size="sm" className="gap-1" asChild>
              <Link href="/dashboard/projects">
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {recentProjects.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Briefcase className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No projects yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-xs">
                  {isFreelancer
                    ? "Create your first project to start tracking work."
                    : "Your freelancer hasn't started any projects yet."}
                </p>
                {isFreelancer && (
                  <DashboardClient />
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Card
                  key={project.id}
                  className="border-border/40 bg-card/50 transition-shadow hover:shadow-md"
                >
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5">
                        {project.budget && project.budget > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ${(project.budget / 100).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <StatusBadge status={project.status} />
                      {project.dueDate && (
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(project.dueDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric" }
                          )}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* -- Recent Activity ----------------------------------- */}
        <aside>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <Card className="border-border/40 bg-card/50">
            <CardContent className="py-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No activity yet.{" "}
                  {isFreelancer
                    ? "Start by creating a project."
                    : "Activity will appear as your freelancer makes progress."}
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                        <Activity className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {formatAction(entry.action)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getTimeAgo(entry.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconClass,
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}) {
  return (
    <Card className="border-border/40 bg-card/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "destructive"
  > = {
    active: "default",
    completed: "success",
    on_hold: "warning",
    cancelled: "destructive",
  };
  return (
    <Badge
      variant={variants[status] ?? "secondary"}
      className="text-xs capitalize"
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    "role.updated": "Set account role",
    "client.created": "Added a new client",
    "client.deleted": "Removed a client",
    "project.created": "Started a new project",
    "project.deleted": "Archived a project",
    "invoice.created": "Created an invoice",
    "task.created": "Added a new task",
  };
  return map[action] ?? action;
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}
