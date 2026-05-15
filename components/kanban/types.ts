import type { ReactNode } from "react";

export type KanbanTask = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export const KANBAN_COLUMNS = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Completed" },
] as const;
