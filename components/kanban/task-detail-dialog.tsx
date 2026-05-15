"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateTask, softDeleteTask } from "@/server/actions/task";
import { toast } from "sonner";
import type { KanbanTask } from "./types";

type TaskDetailDialogProps = {
  task: KanbanTask;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
}: TaskDetailDialogProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [assignee, setAssignee] = useState(task.assignee ?? "");
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setPriority(task.priority);
      setAssignee(task.assignee ?? "");
      setStatus(task.status);
      setDueDate(task.dueDate ?? "");
      setEditing(false);
    }
  }, [open, task]);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await updateTask(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        priority: priority as "low" | "medium" | "high",
        assignee: assignee.trim() || null,
        status: status as "todo" | "in_progress" | "review" | "done",
        dueDate: dueDate || null,
      });
      toast.success("Task updated");
      setEditing(false);
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update task"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await softDeleteTask(task.id);
      toast.success("Task deleted");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete task"
      );
    } finally {
      setDeleting(false);
    }
  }

  const priorityVariant: Record<string, "default" | "destructive" | "warning"> =
    { high: "destructive", medium: "warning", low: "default" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Edit Task" : "Task Details"}
          </DialogTitle>
          <DialogDescription>
            {editing
              ? "Make changes to this task."
              : `Created ${new Date(task.createdAt).toLocaleDateString()}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {editing ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={300}
                  required
                  autoFocus
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-desc">Description</Label>
                <Textarea
                  id="edit-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={2000}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Assignee</Label>
                  <Input
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Badge variant={priorityVariant[task.priority] ?? "secondary"}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className="capitalize">
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                {task.assignee && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" /> {task.assignee}
                  </div>
                )}
                {task.dueDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {new Date(task.dueDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
          <div className="flex gap-2">
            {editing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
