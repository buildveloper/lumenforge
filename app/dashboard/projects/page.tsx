import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

import { PageHeader, PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ProjectsView } from "@/components/dashboard/projects-view";
import { getClientOptions } from "@/server/actions/client";
import { getUserProjects } from "@/server/actions/project";
import { getProfile } from "@/server/actions/user";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string; client?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";
  const params = await searchParams;

  const [projectData, clients] = await Promise.all([
    getUserProjects({ page: 1, limit: 60, clientId: params.client }),
    isClient ? Promise.resolve([]) : getClientOptions(),
  ]);

  const clientFilterName = params.client
    ? (projectData.projects[0]?.clientName ?? "this client")
    : undefined;

  return (
    <PageShell>
      <PageHeader
        title="Projects"
        description={
          clientFilterName
            ? `Filtered to ${clientFilterName}`
            : projectData.total === 0
              ? "One project per engagement, with its tasks and invoices attached."
              : `${projectData.total} project${projectData.total === 1 ? "" : "s"}`
        }
        actions={
          params.client ? (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/dashboard/projects">
                <X className="size-3.5" />
                Clear filter
              </Link>
            </Button>
          ) : null
        }
      />

      <ProjectsView
        projects={projectData.projects}
        clients={clients}
        isClient={isClient}
        initialOpen={params.new === "1"}
        clientFilterName={clientFilterName}
      />
    </PageShell>
  );
}
