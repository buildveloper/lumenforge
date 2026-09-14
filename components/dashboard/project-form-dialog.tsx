"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field, describedBy } from "@/components/app/field";
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
import { createProject, updateProject } from "@/server/actions/project";

export type ClientOption = { id: string; name: string; company: string | null };

export type ProjectFormValues = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  dueDate: string | null;
  clientId: string | null;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On hold" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const NO_CLIENT = "__none__";

/**
 * One dialog for creating and editing a project. The previous build had two
 * near-identical files that drifted apart; a project form is a project form.
 */
export function ProjectFormDialog({
  open,
  onOpenChange,
  clients,
  project,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clients: ClientOption[];
  project?: ProjectFormValues;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ProjectForm clients={clients} project={project} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function ProjectForm({
  clients,
  project,
  onOpenChange,
}: {
  clients: ClientOption[];
  project?: ProjectFormValues;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = Boolean(project);
  const router = useRouter();

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [budget, setBudget] = useState(
    project?.budget ? String(project.budget / 100) : ""
  );
  const [dueDate, setDueDate] = useState(
    toDateInputValue(project?.dueDate ?? null)
  );
  const [status, setStatus] = useState(project?.status ?? "active");
  const [clientId, setClientId] = useState(project?.clientId ?? NO_CLIENT);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Give the project a name so you can find it later.");
      return;
    }

    setSaving(true);
    setError(undefined);

    const base = {
      title: title.trim(),
      description: description.trim() || undefined,
      budget: Math.round((Number.parseFloat(budget) || 0) * 100),
      status: status as "active" | "completed" | "on_hold" | "cancelled",
    };
    const dueDateValue = dueDate || null;
    const clientIdValue = clientId === NO_CLIENT ? null : clientId;

    try {
      if (editing && project) {
        const result = await updateProject(project.id, {
          ...base,
          description: base.description ?? null,
          dueDate: dueDateValue,
          clientId: clientIdValue,
        });
        if (!result.success) throw new Error();
        toast.success("Project updated");
      } else {
        const result = await createProject({
          ...base,
          dueDate: dueDateValue ?? undefined,
          clientId: clientIdValue ?? undefined,
        });
        if (!result.success) throw new Error();
        toast.success(`${result.title} created`);
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      setSaving(false);
      toast.error(
        editing
          ? "Couldn't save the project. Your changes are still in the form."
          : "Couldn't create the project. Try again."
      );
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit project" : "New project"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Update the scope, budget, or deadline."
            : "A project holds its tasks, invoices, and client together."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4">
          <Field label="Project name" htmlFor="project-title" error={error}>
            <Input
              id="project-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Website redesign"
              maxLength={300}
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={describedBy("project-title", error)}
            />
          </Field>

          <Field
            label="Client"
            htmlFor="project-client"
            optional
            hint={
              clients.length === 0
                ? "Add a client first to share this project with them."
                : "The linked client can see this project in their portal."
            }
          >
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="project-client">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_CLIENT}>No client</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.company
                      ? `${client.name} · ${client.company}`
                      : client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Scope" htmlFor="project-description" optional>
            <Textarea
              id="project-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What are you delivering, and what is out of scope?"
              maxLength={2000}
              rows={3}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Budget" htmlFor="project-budget" optional hint="In dollars">
              <Input
                id="project-budget"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="0.00"
              />
            </Field>

            <Field label="Deadline" htmlFor="project-due" optional>
              <Input
                id="project-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </Field>
          </div>

          <Field label="Status" htmlFor="project-status">
            <Select
              value={status}
              onValueChange={setStatus}
            >
              <SelectTrigger id="project-status">
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
                  : "Create project"}
            </Button>
          </DialogFooter>
      </form>
    </>
  );
}
