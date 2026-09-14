import { getUserId } from "@/server/helpers/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Briefcase } from "lucide-react";

import { ActivityFeed } from "@/components/app/activity-feed";
import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { PageHeader, PageShell, Section } from "@/components/app/page-shell";
import { StatTile } from "@/components/app/stat-tile";
import { BarChart } from "@/components/charts/bar-chart";
import { NewProjectButton } from "@/components/dashboard/new-project-button";
import { ProjectCard } from "@/components/dashboard/project-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  daysOverdue,
  formatDeadline,
  formatMoney,
  isOverdue,
} from "@/lib/format";
import { getRecentActivity } from "@/server/actions/activity";
import {
  getClientCount,
  getClientCounterparties,
  getClientOptions,
} from "@/server/actions/client";
import {
  getInvoiceSummary,
  getOverdueInvoices,
} from "@/server/actions/invoice";
import { getUserProjects } from "@/server/actions/project";
import { getOpenTasks } from "@/server/actions/task";
import { getProfile } from "@/server/actions/user";
import { cn } from "@/lib/utils";

type Attention = {
  id: string;
  href: string;
  title: string;
  reason: string;
  value: string;
  tone: "negative" | "signal";
};

function buildAttention({
  overdueInvoices,
  tasks,
  projects,
}: {
  overdueInvoices: Awaited<ReturnType<typeof getOverdueInvoices>>;
  tasks: Awaited<ReturnType<typeof getOpenTasks>>;
  projects: Awaited<ReturnType<typeof getUserProjects>>["projects"];
}): Attention[] {
  const money: Attention[] = overdueInvoices.map((invoice) => ({
    id: `invoice-${invoice.id}`,
    href: `/dashboard/invoices/${invoice.id}`,
    title: invoice.invoiceNumber,
    reason: `${invoice.clientName ?? invoice.projectTitle ?? "Invoice"} Â· ${
      daysOverdue(invoice.dueDate) || 0
    } days late`,
    value: formatMoney(invoice.amount, { decimals: true }),
    tone: "negative",
  }));

  const lateProjects: Attention[] = projects
    .filter(
      (project) =>
        project.status !== "completed" &&
        project.status !== "cancelled" &&
        isOverdue(project.dueDate)
    )
    .map((project) => ({
      id: `project-${project.id}`,
      href: `/dashboard/projects/${project.id}`,
      title: project.title,
      reason: formatDeadline(project.dueDate),
      value: "Deadline",
      tone: "negative" as const,
    }));

  const dueWork: Attention[] = tasks
    .filter((task) => task.dueDate && isOverdue(task.dueDate))
    .map((task) => ({
      id: `task-${task.id}`,
      href: task.projectId ? `/dashboard/projects/${task.projectId}` : "/dashboard/tasks",
      title: task.title,
      reason: `${task.projectTitle ?? "No project"} Â· ${formatDeadline(task.dueDate)}`,
      value: task.priority === "high" ? "High priority" : "Task",
      tone: "signal" as const,
    }));

  return [...money, ...lateProjects, ...dueWork].slice(0, 6);
}

export default async function DashboardPage() {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  // The role picker is on screen; there is nothing meaningful to show behind it.
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";

  const [summary, projectData, tasks, overdueInvoices, activity, clientCount, clients, counterparties] =
    await Promise.all([
      getInvoiceSummary(),
      getUserProjects({ page: 1, limit: 6 }),
      getOpenTasks(6),
      getOverdueInvoices(6),
      getRecentActivity(8),
      isClient ? Promise.resolve(0) : getClientCount(),
      isClient ? Promise.resolve([]) : getClientOptions(),
      isClient ? getClientCounterparties() : Promise.resolve([]),
    ]);

  const attention = buildAttention({
    overdueInvoices,
    tasks,
    projects: projectData.projects,
  });

  const dueThisWeek = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const due = new Date(task.dueDate);
    const week = new Date();
    week.setDate(week.getDate() + 7);
    return due <= week;
  }).length;

  const state = [
    `${projectData.total} ${projectData.total === 1 ? "project" : "projects"}`,
    summary.outstanding > 0 ? `${formatMoney(summary.outstanding)} outstanding` : null,
    attention.length > 0 ? `${attention.length} needing attention` : null,
  ]
    .filter(Boolean)
    .join(" Â· ");

  const counterparty = counterparties[0]?.name ?? null;

  return (
    <PageShell>
      <PageHeader
        title={isClient ? "Your projects" : "Overview"}
        description={
          isClient && counterparty
            ? `Working with ${counterparty} Â· ${state}`
            : state
        }
        actions={
          isClient ? (
            <Button variant="outline" className="gap-2" asChild>
              <Link href="/dashboard/invoices">
                View invoices
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <NewProjectButton clients={clients} />
          )
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Outstanding"
          value={formatMoney(summary.outstanding)}
          hint={
            summary.outstanding === 0
              ? "Nothing awaiting payment"
              : "Sent and not yet paid"
          }
          tone={summary.overdue > 0 ? "signal" : "default"}
          href="/dashboard/invoices?status=sent"
        />
        <StatTile
          label={isClient ? "Overdue" : "Overdue"}
          value={formatMoney(summary.overdue)}
          hint={
            summary.overdue === 0
              ? "All current"
              : `${overdueInvoices.length} invoice${
                  overdueInvoices.length === 1 ? "" : "s"
                } past due`
          }
          tone={summary.overdue > 0 ? "negative" : "default"}
          href="/dashboard/invoices?status=overdue"
        />
        <StatTile
          label="Active projects"
          value={projectData.projects.filter((p) => p.status === "active").length}
          hint={
            projectData.total > 0
              ? `${projectData.total} total`
              : "None running yet"
          }
          href="/dashboard/projects"
        />
        <StatTile
          label={isClient ? "Invoices paid" : "Clients"}
          value={
            isClient ? formatMoney(summary.collected) : clientCount
          }
          hint={
            isClient
              ? `${dueThisWeek} task${dueThisWeek === 1 ? "" : "s"} due this week`
              : "Contacts in your directory"
          }
          tone={isClient && summary.collected > 0 ? "positive" : "default"}
          href={isClient ? "/dashboard/invoices?status=paid" : "/dashboard/clients"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <Section
            title="Needs attention"
            action={
              attention.length > 0 ? (
                <span className="text-[12px] text-muted-foreground">
                  {attention.length} item{attention.length === 1 ? "" : "s"}
                </span>
              ) : null
            }
          >
            {attention.length === 0 ? (
              <Card>
                <CardContent className="py-8">
                  <p className="text-center text-[13px] text-muted-foreground">
                    Nothing overdue and nothing due this week. Good place to be.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <ul>
                    {attention.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-raised/50"
                        >
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              item.tone === "negative" ? "bg-negative" : "bg-signal"
                            )}
                          />
                          <span className="min-w-0 flex-1">
                            <Num className="block truncate text-[13px] font-medium">
                              {item.title}
                            </Num>
                            <span className="block truncate text-[12px] text-muted-foreground">
                              {item.reason}
                            </span>
                          </span>
                          <Num
                            className={cn(
                              "shrink-0 text-[12px]",
                              item.tone === "negative"
                                ? "text-negative"
                                : "text-muted-foreground"
                            )}
                          >
                            {item.value}
                          </Num>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </Section>

          <Section
            title={isClient ? "Your projects" : "Projects"}
            action={
              projectData.total > projectData.projects.length ? (
                <Button variant="ghost" size="sm" className="gap-1" asChild>
                  <Link href="/dashboard/projects">
                    All {projectData.total}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </Button>
              ) : null
            }
          >
            {projectData.projects.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title={isClient ? "No shared projects yet" : "No projects yet"}
                description={
                  isClient
                    ? "Projects appear here once your freelancer links your email address to one."
                    : "A project is where tasks, invoices, and a client come together. Start with the first one."
                }
                action={
                  isClient ? null : (
                    <NewProjectButton clients={clients} label="Create a project" />
                  )
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {projectData.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </Section>
        </div>

        <aside className="flex flex-col gap-6">
          <Section title={isClient ? "Invoiced vs paid" : "Invoiced vs collected"}>
            <Card>
              <CardContent className="pt-4">
                {summary.count === 0 ? (
                  <p className="py-6 text-center text-[12px] text-muted-foreground">
                    No invoices yet, so there is nothing to chart.
                  </p>
                ) : (
                  <BarChart
                    data={summary.months.map((month) => ({
                      label: month.label,
                      value: month.invoiced,
                      compare: month.paid,
                    }))}
                    formatValue={(value) => formatMoney(value)}
                    primaryLabel="Invoiced"
                    compareLabel={isClient ? "Paid" : "Collected"}
                  />
                )}
              </CardContent>
            </Card>
          </Section>

          <Section
            title={isClient ? "Updates" : "Recent activity"}
            action={
              activity.length > 0 ? (
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard/activity">All</Link>
                </Button>
              ) : null
            }
          >
            <Card>
              <CardContent className="p-1.5">
                {activity.length === 0 ? (
                  <p className="px-2 py-6 text-center text-[12px] text-muted-foreground">
                    {isClient
                      ? "Updates from your freelancer will land here."
                      : "Creating a project, task, or invoice writes the first entry."}
                  </p>
                ) : (
                  <ActivityFeed items={activity} dense />
                )}
              </CardContent>
            </Card>
          </Section>
        </aside>
      </div>
    </PageShell>
  );
}
