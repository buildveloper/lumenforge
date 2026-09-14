"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, MoreHorizontal, Pencil, Plus, SquareCheck, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { Segmented } from "@/components/app/segmented";
import { StatusChip } from "@/components/app/status-chip";
import { withUndo } from "@/components/app/with-undo";
import {
  TaskFormDialog,
  type TaskProjectOption,
} from "@/components/kanban/create-task-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, isOverdue } from "@/lib/format";
import { restoreTask, softDeleteTask } from "@/server/actions/task";
import { cn } from "@/lib/utils";

export type TaskRecord = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
  projectId: string | null;
  projectTitle: string | null;
};

type Filter = "open" | "todo" | "in_progress" | "review" | "done" | "all";

export function NewTaskButton({
  projects,
  label = "New task",
  initialOpen = false,
}: {
  projects: TaskProjectOption[];
  label?: string;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)} disabled={projects.length === 0}>
        <Plus className="size-4" />
        {label}
      </Button>
      <TaskFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            if (initialOpen) router.replace("/dashboard/tasks");
            router.refresh();
          }
        }}
        projects={projects}
      />
    </>
  );
}

export function TasksTable({
  tasks,
  projects,
  isClient,
}: {
  tasks: TaskRecord[];
  projects: TaskProjectOption[];
  isClient: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("open");
  const [overdueFirst, setOverdueFirst] = useState(true);
  const [editing, setEditing] = useState<TaskRecord | null>(null);
  const router = useRouter();

  const visible = useMemo(() => {
    const filtered = tasks.filter((task) => {
      if (filter === "all") return true;
      if (filter === "open") return task.status !== "done";
      return task.status === filter;
    });

    // Everything without a date sinks to the bottom, undated work is not urgent.
    return [...filtered].sort((a, b) => {
      if (!overdueFirst) return 0;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    });
  }, [tasks, filter, overdueFirst]);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={SquareCheck}
        title="No tasks yet"
        description={
          isClient
            ? "Work your freelancer adds to your projects shows up here."
            : "Tasks live inside projects so their progress rolls up automatically. Create a project first, then break it into work."
        }
        action={
          isClient ? null : projects.length > 0 ? (
            <NewTaskButton projects={projects} label="Create a task" />
          ) : (
            <Button asChild className="gap-2">
              <Link href="/dashboard/projects?new=1">
                <Plus className="size-4" />
                Create a project first
              </Link>
            </Button>
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        id="tasks"
        value={filter}
        onChange={setFilter}
        options={[
          {
            value: "open",
            label: "Open",
            count: tasks.filter((task) => task.status !== "done").length,
          },
          {
            value: "in_progress",
            label: "In progress",
            count: tasks.filter((task) => task.status === "in_progress").length,
          },
          {
            value: "review",
            label: "Review",
            count: tasks.filter((task) => task.status === "review").length,
          },
          {
            value: "done",
            label: "Done",
            count: tasks.filter((task) => task.status === "done").length,
          },
          { value: "all", label: "All", count: tasks.length },
        ]}
      />

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface-sunken/40 px-4 py-8 text-center text-[13px] text-muted-foreground">
          Nothing in this column.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[42%]">Task</TableHead>
                <TableHead className="hidden w-[20%] md:table-cell">Project</TableHead>
                <TableHead className="w-[14%]">Status</TableHead>
                <TableHead className="w-[16%]">
                  <button
                    type="button"
                    onClick={() => setOverdueFirst((value) => !value)}
                    className={cn(
                      "col-head inline-flex items-center gap-1 transition-colors hover:text-foreground",
                      overdueFirst && "text-foreground"
                    )}
                  >
                    Due
                    <ArrowUpDown className="size-3" />
                  </button>
                </TableHead>
                <TableHead className="w-[8%]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((task) => {
                const overdue = task.status !== "done" && isOverdue(task.dueDate);
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 shrink-0 rounded-full",
                            task.priority === "high"
                              ? "bg-negative"
                              : task.priority === "medium"
                                ? "bg-signal"
                                : "bg-border-strong"
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium">
                            {task.title}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {task.priority} priority
                            {task.assignee ? ` · ${task.assignee}` : ""}
                            {task.projectTitle ? ` · ${task.projectTitle}` : ""}
                          </span>
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {task.projectId ? (
                        <Link
                          href={`/dashboard/projects/${task.projectId}`}
                          className="truncate text-[12px] text-muted-foreground hover:text-foreground"
                        >
                          {task.projectTitle ?? "Project"}
                        </Link>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell>
                      <StatusChip status={task.status} />
                    </TableCell>

                    <TableCell>
                      <Num
                        className={cn(
                          "text-[12px]",
                          overdue ? "font-medium text-negative" : "text-muted-foreground"
                        )}
                      >
                        {task.dueDate ? formatDate(task.dueDate) : "—"}
                      </Num>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end">
                        {isClient ? null : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Actions for ${task.title}`}
                                className="text-muted-foreground"
                              >
                                <MoreHorizontal className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onSelect={() => setEditing(task)}>
                                <Pencil />
                                Edit task
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                tone="danger"
                                onSelect={() => {
                                  void withUndo({
                                    message: `“${task.title}” deleted`,
                                    remove: () => softDeleteTask(task.id),
                                    undo: () => restoreTask(task.id),
                                    restoredMessage: `“${task.title}” restored`,
                                  }).then((ok) => {
                                    if (ok) router.refresh();
                                  });
                                }}
                              >
                                <Trash2 />
                                Delete task
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <TaskFormDialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null);
            router.refresh();
          }
        }}
        projects={projects}
        task={
          editing
            ? {
                id: editing.id,
                title: editing.title,
                description: editing.description,
                status: editing.status,
                priority: editing.priority,
                assignee: editing.assignee,
                dueDate: editing.dueDate,
              }
            : undefined
        }
      />
    </div>
  );
}
