"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { updateTaskStatus } from "@/server/actions/task";
import { TaskFormDialog } from "./create-task-dialog";
import { KanbanColumn } from "./kanban-column";
import { TaskCardBody } from "./task-card";
import { KANBAN_COLUMNS, type KanbanTask } from "./types";

type KanbanBoardProps = {
  projectId: string;
  tasks: KanbanTask[];
  showCreate?: boolean;
};

const COLUMN_LABEL = new Map(
  KANBAN_COLUMNS.map((column) => [column.id as string, column.label])
);

export function KanbanBoard({
  projectId,
  tasks: serverTasks,
  showCreate = true,
}: KanbanBoardProps) {
  const router = useRouter();
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
  const [editing, setEditing] = useState<KanbanTask | null>(null);
  const [createStatus, setCreateStatus] = useState<string | null>(null);

  /**
   * Optimistic moves are held as overrides rather than a copy of the server
   * list, so the board never needs an effect to re-sync after a refresh and a
   * move cannot be lost to a stale copy.
   */
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const tasks = serverTasks.map((task) =>
    overrides[task.id] ? { ...task, status: overrides[task.id] } : task
  );

  const sensors = useSensors(
    // A 6px threshold lets a plain click open the card instead of starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const announcements: Announcements = {
    onDragStart: ({ active }) => {
      const task = tasks.find((item) => item.id === active.id);
      return task ? `Picked up ${task.title}.` : "Picked up a task.";
    },
    onDragOver: ({ active, over }) => {
      const task = tasks.find((item) => item.id === active.id);
      const column = over ? COLUMN_LABEL.get(String(over.id)) : undefined;
      return column && task
        ? `${task.title} is over ${column}.`
        : `${task?.title ?? "Task"} is between columns.`;
    },
    onDragEnd: ({ active, over }) => {
      const task = tasks.find((item) => item.id === active.id);
      const column = over ? COLUMN_LABEL.get(String(over.id)) : undefined;
      return column && task
        ? `${task.title} moved to ${column}.`
        : `${task?.title ?? "Task"} was not moved.`;
    },
    onDragCancel: ({ active }) => {
      const task = tasks.find((item) => item.id === active.id);
      return `${task?.title ?? "Task"} returned to its column.`;
    },
  };

  const getColumnTasks = useCallback(
    (columnId: string) => tasks.filter((task) => task.status === columnId),
    [tasks]
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((item) => item.id === event.active.id);
    if (task) setActiveTask(task);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const taskId = String(active.id);
    const nextStatus = String(over.id);
    if (!COLUMN_LABEL.has(nextStatus)) return;

    const task = tasks.find((item) => item.id === taskId);
    if (!task || task.status === nextStatus) return;

    setOverrides((prev) => ({ ...prev, [taskId]: nextStatus }));

    try {
      await updateTaskStatus(taskId, {
        status: nextStatus as "todo" | "in_progress" | "review" | "done",
      });
      router.refresh();
    } catch {
      // Dropping the override restores whatever the server still says.
      setOverrides((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      toast.error("Couldn't move that task. It's back where it was.");
    }
  }

  const openCount = tasks.filter((task) => task.status !== "done").length;

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13px] text-muted-foreground">
          {tasks.length === 0
            ? "Break the work into tasks you can finish."
            : `${openCount} open of ${tasks.length}`}
        </p>
        {showCreate ? (
          <Button size="sm" className="gap-2" onClick={() => setCreateStatus("todo")}>
            <Plus className="size-3.5" />
            New task
          </Button>
        ) : null}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveTask(null)}
      >
        <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-3 scroll-thin">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              tasks={getColumnTasks(column.id)}
              onTaskClick={setEditing}
              onAddTask={setCreateStatus}
              canCreate={showCreate}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{ duration: 180, easing: "cubic-bezier(0.16,1,0.3,1)" }}
        >
          {activeTask ? (
            <div className="rotate-2">
              <TaskCardBody
                task={activeTask}
                className="border-signal/40 shadow-overlay"
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormDialog
        open={createStatus !== null}
        onOpenChange={(next) => {
          if (!next) {
            setCreateStatus(null);
            router.refresh();
          }
        }}
        projectId={projectId}
        initialStatus={createStatus ?? "todo"}
      />

      <TaskFormDialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null);
            router.refresh();
          }
        }}
        projectId={projectId}
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
    </>
  );
}
