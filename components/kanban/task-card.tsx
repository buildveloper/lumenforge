"use client";

import { Calendar, User } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Num } from "@/components/app/num";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, isOverdue } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { KanbanTask } from "./types";

const RAIL: Record<string, string> = {
  high: "before:bg-negative",
  medium: "before:bg-signal",
  low: "before:bg-border-strong",
};

/** Shared presentation, so the drag overlay never re-registers a sortable. */
export function TaskCardBody({
  task,
  className,
}: {
  task: KanbanTask;
  className?: string;
}) {
  const overdue = task.status !== "done" && isOverdue(task.dueDate);

  return (
    <Card
      className={cn(
        "relative overflow-hidden pl-[3px]",
        "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
        RAIL[task.priority] ?? RAIL.low,
        className
      )}
    >
      <CardContent className="p-3">
        <p className="text-[13px] font-medium leading-snug">{task.title}</p>

        {task.description ? (
          <p className="mt-1 line-clamp-2 text-[12px] leading-4 text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        {task.assignee || task.dueDate ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {task.assignee ? (
              <span className="flex items-center gap-1">
                <User className="size-3" />
                {task.assignee}
              </span>
            ) : null}
            {task.dueDate ? (
              <span
                className={cn(
                  "flex items-center gap-1",
                  overdue && "font-medium text-negative"
                )}
              >
                <Calendar className="size-3" />
                <Num>{formatDate(task.dueDate)}</Num>
              </span>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

/**
 * The whole card is the drag handle rather than a grip icon: a 6px activation
 * distance keeps plain clicks working, and putting the listeners on the root is
 * what makes the card draggable by keyboard instead of pointer-only.
 */
export function TaskCard({
  task,
  onClick,
  interactive = true,
}: {
  task: KanbanTask;
  onClick: (task: KanbanTask) => void;
  interactive?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id, data: { task } });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
      }}
      onClick={interactive ? () => onClick(task) : undefined}
      className={cn(
        "rounded-lg outline-offset-2",
        interactive && "cursor-pointer hover:[&>div]:border-border-strong"
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCardBody task={task} />
    </div>
  );
}
