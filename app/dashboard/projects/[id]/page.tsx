import { getUserId } from "@/server/helpers/session";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase } from "lucide-react";

import { ActivityFeed } from "@/components/app/activity-feed";
import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { PageShell } from "@/components/app/page-shell";
import { StatTile } from "@/components/app/stat-tile";
import { StatusChip } from "@/components/app/status-chip";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { QuickAIActions } from "@/components/ai/quick-ai-actions";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { NewInvoiceButton } from "@/components/dashboard/invoices-view";
import { EditProjectButton } from "@/components/dashboard/new-project-button";
import { ProjectDecision } from "@/components/dashboard/project-decision";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDateLong, formatDeadline, formatMoney } from "@/lib/format";
import { getClientOptions } from "@/server/actions/client";
import { getProjectInvoices } from "@/server/actions/invoice";
import {
  getLatestProjectDecision,
  getProjectActivity,
  getProjectById,
} from "@/server/actions/project";
import { getProjectTasks } from "@/server/actions/task";
import { getProfile } from "@/server/actions/user";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const profile = await getProfile();
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";

  let project;
  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  const [tasks, invoices, activity, decision, clients] = await Promise.all([
    getProjectTasks(id),
    getProjectInvoices(id),
    getProjectActivity(id),
    getLatestProjectDecision(id),
    isClient ? Promise.resolve([]) : getClientOptions(),
  ]);

  const doneTasks = tasks.filter((task) => task.status === "done").length;
  const party = project.clientName ?? project.clientCompany ?? "No client";
  const outstanding = invoices
    .filter((invoice) => invoice.status === "sent" || invoice.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <PageShell>
      <Breadcrumbs
        items={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Projects", href: "/dashboard/projects" },
          { label: project.title },
        ]}
      />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-border bg-surface-sunken text-muted-foreground">
            <Briefcase className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {project.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
              <StatusChip status={project.status} />
              <span className="text-[13px] text-muted-foreground">{party}</span>
              <span className="text-[13px] text-muted-foreground">
                {formatDeadline(project.dueDate)}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          {isClient ? (
            <ProjectDecision projectId={id} decision={decision} />
          ) : (
            <EditProjectButton
              clients={clients}
              label="Edit project"
              project={{
                id: project.id,
                title: project.title,
                description: project.description,
                status: project.status,
                budget: project.budget,
                dueDate: project.dueDate,
                clientId: project.clientId,
              }}
            />
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Progress"
          value={tasks.length === 0 ? "â€”" : `${doneTasks}/${tasks.length}`}
          hint={
            tasks.length === 0
              ? "No tasks yet"
              : `${Math.round((doneTasks / tasks.length) * 100)}% complete`
          }
          tone={tasks.length > 0 && doneTasks === tasks.length ? "positive" : "default"}
        />
        <StatTile
          label="Budget"
          value={project.budget ? formatMoney(project.budget) : "â€”"}
          hint={project.budget ? "Agreed scope" : "Not set"}
        />
        <StatTile
          label="Outstanding"
          value={formatMoney(outstanding)}
          hint={
            invoices.length === 0
              ? "No invoices yet"
              : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`
          }
          tone={outstanding > 0 ? "signal" : "default"}
        />
        <StatTile
          label="Deadline"
          value={project.dueDate ? formatDeadline(project.dueDate).replace("Due ", "") : "â€”"}
          hint={project.dueDate ? formatDateLong(project.dueDate) : "No deadline set"}
        />
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="sticky top-14 z-10 -mx-4 overflow-x-auto bg-background/95 px-4 backdrop-blur-md sm:-mx-6 sm:px-6 scroll-thin">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {project.description ? (
            <div className="max-w-2xl">
              <p className="whitespace-pre-wrap text-[14px] leading-6 text-muted-foreground">
                {project.description}
              </p>
            </div>
          ) : (
            <EmptyState
              title="No scope written down"
              description={
                isClient
                  ? "Your freelancer hasn't added a description to this project yet."
                  : "Describe what you're delivering and what is out of scope. It gives the AI something to work from and settles arguments later."
              }
            />
          )}

          {isClient ? null : (
            <div className="mt-8">
              <QuickAIActions projectId={id} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="tasks">
          <KanbanBoard
            projectId={id}
            tasks={tasks}
            showCreate={!isClient}
          />
        </TabsContent>

        <TabsContent value="invoices">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-[13px] font-semibold">
              {invoices.length === 0
                ? "Invoices"
                : `${invoices.length} invoice${invoices.length === 1 ? "" : "s"}`}
            </h2>
            <NewInvoiceButton projectId={id} />
          </div>

          {invoices.length === 0 ? (
            <EmptyState
              title="No invoices yet"
              description={
                isClient
                  ? "Invoices your freelancer raises for this project will appear here."
                  : "Raise an invoice for this project and it gets a number automatically."
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              {invoices.map((invoice) => (
                <InvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity">
          {activity.length === 0 ? (
            <EmptyState
              title="Nothing logged yet"
              description="Every change to this project, its tasks, and its invoices lands here with a timestamp."
            />
          ) : (
            <div className="rounded-lg border border-border bg-card p-1.5">
              <ActivityFeed items={activity} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          <AIAssistant projectId={id} />
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="size-3.5" />
            All projects
          </Link>
        </Button>
        <Num className="text-[11px] text-muted-foreground">
          Updated {formatDateLong(project.updatedAt)}
        </Num>
      </div>
    </PageShell>
  );
}
