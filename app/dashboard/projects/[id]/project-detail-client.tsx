"use client";

import { useState } from "react";
import { Pencil, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditProjectDialog } from "@/components/dashboard/edit-project-dialog";
import { toast } from "sonner";

type ProjectDetailClientProps = {
  project: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    budget: number | null;
    dueDate: string | null;
  };
  role?: string;
};

export function ProjectDetailClient({ project, role }: ProjectDetailClientProps) {
  const [editOpen, setEditOpen] = useState(false);
  const isFreelancer = role === "freelancer";

  if (isFreelancer) {
    return (
      <>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <EditProjectDialog
          project={project}
          open={editOpen}
          onOpenChange={setEditOpen}
        />
      </>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => toast.success("Change request sent to freelancer")}
      >
        <MessageSquare className="h-4 w-4" />
        Request Changes
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => toast.success("Milestone approved")}
      >
        <CheckCircle className="h-4 w-4" />
        Approve
      </Button>
    </div>
  );
}
