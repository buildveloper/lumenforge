"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { Num } from "@/components/app/num";
import { cn } from "@/lib/utils";
import type { KanbanTask } from "./types";
import { TaskCard } from "./task-card";

export function KanbanColumn({
  columnId,
  label,
  tasks,
  onTaskClick,
  onAddTask,
  canCreate,
}: {
  columnId: string;
  label: string;
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
  onAddTask?: (columnId: string) => void;
  canCreate?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div className="flex min-w-[264px] max-w-[300px] flex-1 flex-col">
      <div className="mb-2.5 flex items-center justify-between gap-2 px-1">
        <h3 className="flex items-center gap-2 text-[12px] font-medium text-muted-foreground">
          {label}
          <Num className="text-[11px] text-muted-foreground/70">{tasks.length}</Num>
        </h3>
        {canCreate && onAddTask ? (
          <button
            type="button"
            onClick={() => onAddTask(columnId)}
            aria-label={`Add a task to ${label}`}
            className="grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground [@media(pointer:coarse)]:size-9"
          >
            <Plus className="size-3.5" />
          </button>
        ) : null}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-32 flex-1 flex-col gap-2 rounded-lg border border-transparent p-2 transition-colors",
          isOver
            ? "border-signal/30 bg-signal-subtle/50"
            : "bg-surface-sunken/50"
        )}
      >
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 ? (
          <p className="grid flex-1 place-items-center rounded-md border border-dashed border-border px-3 py-6 text-center text-[11px] text-muted-foreground">
            {isOver ? "Drop here" : "Nothing in this column"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
