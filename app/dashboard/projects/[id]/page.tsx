import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, Pencil, Briefcase, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { ProjectDetailClient } from "./project-detail-client";
import { Breadcrumbs } from "@/components/dashboard/breadcrumbs";
import { getProjectById } from "@/server/actions/project";
import { getProjectTasks } from "@/server/actions/task";
import { getProjectInvoices } from "@/server/actions/invoice";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { InvoicesClient } from "@/app/dashboard/invoices/invoices-client";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { AIAssistant } from "@/components/ai/ai-assistant";
import { getDashboardData } from "@/server/actions/user";
import { QuickAIActions } from "@/components/ai/quick-ai-actions";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProjectDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let project;
  try {
    project = await getProjectById(id);
  } catch {
    notFound();
  }

  const clientName = project.clientName ?? project.clientCompany ?? "No client";
  const budgetDisplay = project.budget
    ? `$${(project.budget / 100).toLocaleString()}`
    : null;
  const dueDateDisplay = project.dueDate
    ? new Date(project.dueDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const projectTasks = await getProjectTasks(id);
  const projectInvoices = await getProjectInvoices(id);
  const { role } = await getDashboardData();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/dashboard/projects" },
          { label: project.title },
        ]}
      />

      {/* -- Back + Edit ------------------------------------------ */}
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" className="gap-2" asChild>
          <Link href="/dashboard/projects">
            <ArrowLeft className="h-4 w-4" />
            All Projects
          </Link>
        </Button>
        <ProjectDetailClient project={project} role={role} />
      </div>

      {/* -- Project Header --------------------------------------- */}
      <div className="mb-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {project.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              <StatusBadge status={project.status} />
              <span className="text-sm text-muted-foreground">
                {clientName}
              </span>
            </div>
          </div>
        </div>

        {/* -- Quick stats ------------------------------------- */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {budgetDisplay && (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Budget</p>
                <p className="text-sm font-semibold">{budgetDisplay}</p>
              </div>
            </div>
          )}
          {dueDateDisplay && (
            <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Deadline</p>
                <p className="text-sm font-semibold">{dueDateDisplay}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 rounded-lg border border-border/40 bg-card/50 px-4 py-3">
            <Briefcase className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-semibold truncate max-w-[120px]">
                {clientName}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-8" />

      {/* -- Tabs -------------------------------------------------- */}
      <Tabs defaultValue="overview">
        <TabsList className="w-full justify-start border-b border-border/40 rounded-none bg-transparent h-auto p-0 mb-8">
          <TabTrigger value="overview" label="Overview" />
          <TabTrigger value="tasks" label="Tasks" />
          <TabTrigger value="invoices" label="Invoices" />
          <TabTrigger value="activity" label="Activity" />
          <TabTrigger value="ai" label="AI Assistant" />
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          {project.description ? (
            <Card className="border-border/40 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Pencil className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">No description</h3>
                <p className="text-sm text-muted-foreground">
                  Add a description to give context about this project.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="mt-6 flex gap-3">
            <ProjectDetailClient project={project} role={role} />
          </div>

          <div className="mt-8">
            <QuickAIActions projectId={id} />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <KanbanBoard projectId={id} tasks={projectTasks} showCreate={role === "freelancer"} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Invoices</h2>
            <InvoicesClient projectId={id} showCreate={role === "freelancer"} />
          </div>
          {projectInvoices.length === 0 ? (
            <Card className="border-dashed border-border/60 bg-muted/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Receipt className="h-8 w-8 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium mb-1">No invoices yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create an invoice for this project to get started.
                </p>
                <InvoicesClient projectId={id} showCreate={role === "freelancer"} />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {projectInvoices.map((inv) => (
                <InvoiceCard key={inv.id} invoice={inv} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activity" className="mt-0">
          <Card className="border-dashed border-border/60 bg-muted/20">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-8 w-8 text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium mb-1">
                Activity feed coming soon
              </h3>
              <p className="text-sm text-muted-foreground">
                A detailed activity timeline for this project will be available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-0">
          <AIAssistant projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
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
      className="text-sm capitalize px-3 py-1"
    >
      {status.replace("_", " ")}
    </Badge>
  );
}

function TabTrigger({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors"
    >
      {label}
    </TabsTrigger>
  );
}
