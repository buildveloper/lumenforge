"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProjectDialog } from "@/components/dashboard/create-project-dialog";

export function DashboardClient() {
  const [showCreateProject, setShowCreateProject] = useState(false);

  return (
    <>
      <Button className="gap-2" onClick={() => setShowCreateProject(true)}>
        <Plus className="h-4 w-4" />
        New Project
      </Button>
      <CreateProjectDialog
        open={showCreateProject}
        onOpenChange={setShowCreateProject}
      />
    </>
  );
}
