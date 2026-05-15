"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";
import { TaskDetailDialog } from "./task-detail-dialog";
import { KANBAN_COLUMNS, type KanbanTask } from "./types";
import { updateTaskStatus } from "@/server/actions/task";
import { toast } from "sonner";

type KanbanBoardProps = {
  projectId: string;
  tasks: KanbanTask[];
  showCreate?: boolean;
};

export function KanbanBoard({ projectId, tasks: initialTasks, showCreate = true }: KanbanBoardProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<KanbanTask | null>(null);

  const getColumnTasks = useCallback(
    (columnId: string) => tasks.filter((t) => t.status === columnId),
    [tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    if (!KANBAN_COLUMNS.some((c) => c.id === newStatus)) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, { status: newStatus as "todo" | "in_progress" | "review" | "done" });
      router.refresh();
    } catch (error) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: task.status } : t))
      );
      toast.error(
        error instanceof Error ? error.message : "Failed to update task"
      );
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Tasks</h2>
        {showCreate && (
          <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        )}
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              tasks={getColumnTasks(column.id)}
              onTaskClick={setDetailTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 opacity-90">
              <TaskCard task={activeTask} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <CreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
      />

      {detailTask && (
        <TaskDetailDialog
          task={detailTask}
          open={!!detailTask}
          onOpenChange={(open) => !open && setDetailTask(null)}
        />
      )}
    </>
  );
}
