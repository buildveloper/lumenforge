import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Briefcase, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { ProjectsClient } from "./projects-client";

import { getUserProjects } from "@/server/actions/project";

export default async function ProjectsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { projects, total } = await getUserProjects({ page: 1, limit: 20 });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* -- Header ------------------------------------------------ */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            {total} project{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <ProjectsClient />
      </div>

      {/* -- Projects List ---------------------------------------- */}
      {projects.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No projects yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first project to start tracking work and
              collaborating.
            </p>
            <ProjectsClient />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
