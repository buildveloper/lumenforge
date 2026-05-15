import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckSquare, Calendar, GripVertical, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getUserTasks } from "@/server/actions/task";
import { getDashboardData } from "@/server/actions/user";
import { StatusBadge } from "@/components/dashboard/status-badge";

const priorityColor: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-primary/10 text-primary",
  high: "bg-destructive/10 text-destructive",
};

export default async function TasksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const tasks = await getUserTasks();
  const { role } = await getDashboardData();
  const isFreelancer = role === "freelancer";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All your tasks across projects.
          </p>
        </div>
        {isFreelancer && (
          <Button size="sm" className="gap-2" disabled>
            <CheckSquare className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <CheckSquare className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {isFreelancer
                ? "Create tasks inside your projects to start tracking work."
                : "Your freelancer hasn&apos;t created any tasks yet."}
            </p>
            {isFreelancer && (
              <Button variant="outline" asChild>
                <Link href="/dashboard/projects">View Projects</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-2">
          {tasks.map((task) => (
            <Card
              key={task.id}
              className="border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
            >
              <CardContent className="flex items-center gap-3 py-3">
                <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${priorityColor[task.priority]}`}
                    >
                      {task.priority}
                    </Badge>
                    {task.assignee && (
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </div>
                {task.projectId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    asChild
                  >
                    <Link href={`/dashboard/projects/${task.projectId}`}>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
