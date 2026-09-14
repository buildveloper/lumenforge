"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ProjectFormDialog,
  type ClientOption,
  type ProjectFormValues,
} from "@/components/dashboard/project-form-dialog";

export function NewProjectButton({
  clients,
  label = "New project",
  variant = "default",
  initialOpen = false,
}: {
  clients: ClientOption[];
  label?: string;
  variant?: "default" | "outline" | "ghost";
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)} className="gap-2">
        <Plus className="size-4" />
        {label}
      </Button>
      <ProjectFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            if (initialOpen) router.replace("/dashboard/projects");
            router.refresh();
          }
        }}
        clients={clients}
      />
    </>
  );
}

export function EditProjectButton({
  clients,
  project,
  label = "Edit",
}: {
  clients: ClientOption[];
  project: ProjectFormValues;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        {label}
      </Button>
      <ProjectFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) router.refresh();
        }}
        clients={clients}
        project={project}
      />
    </>
  );
}
