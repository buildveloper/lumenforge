import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/app/status-chip";
import { Num } from "@/components/app/num";
import { formatDeadline, formatMoney, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  dueDate: string | null;
  clientName: string | null;
  clientCompany: string | null;
  updatedAt: string;
  taskTotal?: number;
  taskDone?: number;
};

export function ProjectCard({ project }: { project: ProjectRow }) {
  const party = project.clientName ?? project.clientCompany ?? "No client";
  const overdue =
    project.status !== "completed" &&
    project.status !== "cancelled" &&
    isOverdue(project.dueDate);

  const hasTasks = (project.taskTotal ?? 0) > 0;
  const percent = hasTasks
    ? Math.round(((project.taskDone ?? 0) / (project.taskTotal ?? 1)) * 100)
    : 0;

  return (
    <Link href={`/dashboard/projects/${project.id}`} className="block">
      <Card className="group transition-colors hover:border-border-strong hover:bg-surface-raised/40">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em]">
                {project.title}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                <StatusChip status={project.status} />
                <span className="truncate text-[12px] text-muted-foreground">
                  {party}
                </span>
                {project.budget != null && project.budget > 0 ? (
                  <Num className="text-[12px] text-muted-foreground">
                    {formatMoney(project.budget)}
                  </Num>
                ) : null}
                <span
                  className={cn(
                    "text-[12px]",
                    overdue
                      ? "font-medium text-negative"
                      : "text-muted-foreground"
                  )}
                >
                  {formatDeadline(project.dueDate)}
                </span>
              </div>
            </div>

            <ArrowRight className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          {hasTasks ? (
            <div className="mt-3.5 flex items-center gap-3">
              <div
                className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised"
                role="img"
                aria-label={`${project.taskDone} of ${project.taskTotal} tasks done`}
              >
                <div
                  className="h-full rounded-full bg-signal transition-[width] duration-[var(--dur-slow)] ease-out-expo"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <Num className="shrink-0 text-[11px] text-muted-foreground">
                {project.taskDone}/{project.taskTotal}
              </Num>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
