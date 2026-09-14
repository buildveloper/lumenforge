"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field } from "@/components/app/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/format";
import { createTask, updateTask } from "@/server/actions/task";

export type TaskProjectOption = { id: string; title: string };

export type TaskFormValues = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assignee: string | null;
  dueDate: string | null;
};

const STATUS_OPTIONS = [
  { value: "todo", label: "To do" },
  { value: "in_progress", label: "In progress" },
  { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];

/**
 * Used both inside a project (project known, no picker) and from the global
 * task list (picker shown). One form, two entry points.
 */
export function TaskFormDialog({
  open,
  onOpenChange,
  projectId,
  projects = [],
  task,
  initialStatus = "todo",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string;
  projects?: TaskProjectOption[];
  task?: TaskFormValues;
  initialStatus?: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <TaskForm
          projectId={projectId}
          projects={projects}
          task={task}
          initialStatus={initialStatus}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({
  projectId,
  projects = [],
  task,
  initialStatus = "todo",
  onOpenChange,
}: {
  projectId?: string;
  projects?: TaskProjectOption[];
  task?: TaskFormValues;
  initialStatus?: string;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = Boolean(task);
  const router = useRouter();
  const needsPicker = !editing && !projectId && projects.length > 0;

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState(task?.priority ?? "medium");
  const [status, setStatus] = useState(task?.status ?? initialStatus);
  const [assignee, setAssignee] = useState(task?.assignee ?? "");
  const [dueDate, setDueDate] = useState(
    toDateInputValue(task?.dueDate ?? null)
  );
  const [selectedProject, setSelectedProject] = useState(
    projectId ?? projects[0]?.id ?? ""
  );
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      setError("A task needs a name.");
      return;
    }

    if (needsPicker && !selectedProject) {
      setError("Choose which project this belongs to.");
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      if (editing && task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || null,
          status: status as "todo" | "in_progress" | "review" | "done",
          priority: priority as "low" | "medium" | "high",
          assignee: assignee.trim() || null,
          dueDate: dueDate || null,
        });
        toast.success("Task updated");
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || undefined,
          status: status as "todo" | "in_progress" | "review" | "done",
          priority: priority as "low" | "medium" | "high",
          assignee: assignee.trim() || undefined,
          dueDate: dueDate || undefined,
          projectId: (projectId ?? selectedProject) || undefined,
        });
        toast.success("Task created");
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      setSaving(false);
      toast.error(
        editing
          ? "Couldn't save the task. Your changes are still in the form."
          : "Couldn't create the task. Try again."
      );
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Change the details or move it to another column."
            : needsPicker
              ? "Pick the project this work belongs to."
              : "Keep it small enough to finish in one sitting."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Task" htmlFor="task-title" error={error}>
            <Input
              id="task-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Design the pricing page"
              maxLength={300}
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "task-title-error" : undefined}
            />
          </Field>

          {needsPicker ? (
            <Field label="Project" htmlFor="task-project">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger id="task-project">
                  <SelectValue placeholder="Choose a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <Field label="Detail" htmlFor="task-description" optional>
            <Textarea
              id="task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What does done look like?"
              maxLength={2000}
              rows={3}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Priority" htmlFor="task-priority">
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger id="task-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Due" htmlFor="task-due" optional>
              <Input
                id="task-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </Field>
          </div>

          {editing ? (
            <Field label="Column" htmlFor="task-status">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="task-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <Field
            label="Owner"
            htmlFor="task-assignee"
            optional
            hint="A name, for reference on the board."
          >
            <Input
              id="task-assignee"
              value={assignee}
              onChange={(event) => setAssignee(event.target.value)}
              placeholder="Alex"
              maxLength={100}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : "Create task"}
            </Button>
          </DialogFooter>
      </form>
    </>
  );
}
