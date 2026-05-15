"use client";

import Link from "next/link";
import { Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
};

export function ProjectCard({ project }: { project: ProjectRow }) {
  const otherParty = project.clientName ?? project.clientCompany ?? "No client";

  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <Card className="group border-border/40 bg-card/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 cursor-pointer">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-sm text-muted-foreground truncate mt-1">
                  {project.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <StatusBadge status={project.status} />
                <span className="text-xs text-muted-foreground">
                  {otherParty}
                </span>
                {project.budget != null && project.budget > 0 && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    {(project.budget / 100).toLocaleString()}
                  </span>
                )}
                {project.dueDate && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "destructive"
  > = {
    active: "default",
    completed: "success",
    on_hold: "warning",
    cancelled: "destructive",
  };
  return (
    <Badge
      variant={variants[status] ?? "secondary"}
      className="text-xs capitalize"
    >
      {status.replace("_", " ")}
    </Badge>
  );
}
