"use client";

import { Calendar, User, Trash2, GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { KanbanTask } from "./types";

type TaskCardProps = {
  task: KanbanTask;
  onClick: (task: KanbanTask) => void;
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityVariant: Record<string, "default" | "destructive" | "warning"> =
    {
      high: "destructive",
      medium: "warning",
      low: "default",
    };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="border-border/40 bg-card/70 cursor-pointer transition-shadow hover:shadow-md hover:border-primary/20"
      onClick={() => onClick(task)}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-medium leading-snug">{task.title}</h4>
            {task.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {task.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge
                variant={priorityVariant[task.priority] ?? "secondary"}
                className="text-[10px] px-1.5 py-0"
              >
                {task.priority}
              </Badge>
              {task.assignee && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <User className="h-3 w-3" />
                  {task.assignee}
                </span>
              )}
              {task.dueDate && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
