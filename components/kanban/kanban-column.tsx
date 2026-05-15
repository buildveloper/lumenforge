"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { KanbanTask } from "./types";
import { TaskCard } from "./task-card";

type KanbanColumnProps = {
  columnId: string;
  label: string;
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
};

export function KanbanColumn({
  columnId,
  label,
  tasks,
  onTaskClick,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </h3>
        <span className="text-xs text-muted-foreground bg-muted/50 rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 p-2 rounded-xl min-h-[200px] transition-colors ${
          isOver ? "bg-primary/5 ring-1 ring-primary/20" : "bg-muted/20"
        }`}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={onTaskClick} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border border-dashed border-border/60 rounded-lg">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
