"use client";

import { useMemo, useState } from "react";

import { Segmented } from "@/components/app/segmented";
import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Briefcase } from "lucide-react";
import type { ClientOption } from "@/components/dashboard/project-form-dialog";
import { NewProjectButton } from "@/components/dashboard/new-project-button";

type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  budget: number | null;
  dueDate: string | null;
  clientName: string | null;
  clientCompany: string | null;
  updatedAt: string;
  taskTotal: number;
  taskDone: number;
};

type Filter = "active" | "on_hold" | "completed" | "all";

export function ProjectsView({
  projects,
  clients,
  isClient,
  initialOpen,
  clientFilterName,
}: {
  projects: ProjectRow[];
  clients: ClientOption[];
  isClient: boolean;
  initialOpen: boolean;
  clientFilterName?: string;
}) {
  const [filter, setFilter] = useState<Filter>(isClient ? "all" : "active");

  const counts = useMemo(
    () => ({
      active: projects.filter((p) => p.status === "active").length,
      on_hold: projects.filter((p) => p.status === "on_hold").length,
      completed: projects.filter((p) => p.status === "completed").length,
    }),
    [projects]
  );

  const visible = useMemo(
    () => (filter === "all" ? projects : projects.filter((p) => p.status === filter)),
    [projects, filter]
  );

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title={
          clientFilterName
            ? `No projects for ${clientFilterName}`
            : isClient
              ? "No shared projects yet"
              : "No projects yet"
        }
        description={
          clientFilterName
            ? "Create a project and link it to this client to start tracking work."
            : isClient
              ? "Projects appear here once your freelancer links your email address to one."
              : "A project holds the tasks, invoices, and client for one engagement. It is the unit everything else hangs off."
        }
        action={
          isClient ? null : (
            <NewProjectButton
              clients={clients}
              label="Create a project"
              initialOpen={initialOpen}
            />
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Segmented
        id="projects"
        value={filter}
        onChange={setFilter}
        options={[
          { value: "active", label: "Active", count: counts.active },
          { value: "on_hold", label: "On hold", count: counts.on_hold },
          { value: "completed", label: "Completed", count: counts.completed },
          { value: "all", label: "All", count: projects.length },
        ]}
      />

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-surface-sunken/40 px-4 py-8 text-center text-[13px] text-muted-foreground">
          No {filter === "on_hold" ? "projects on hold" : filter} projects.
          <span className="ml-1">
            <Num>{projects.length}</Num> in total.
          </span>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
