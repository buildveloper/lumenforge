import { getUserId } from "@/server/helpers/session";
import { redirect } from "next/navigation";

import { PageHeader, PageShell } from "@/components/app/page-shell";
import { NewTaskButton, TasksTable } from "@/components/dashboard/tasks-view";
import { isOverdue } from "@/lib/format";
import { getProjectOptions } from "@/server/actions/project";
import { getUserTasks } from "@/server/actions/task";
import { getProfile } from "@/server/actions/user";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";
  const params = await searchParams;

  const [tasks, projects] = await Promise.all([
    getUserTasks(),
    isClient ? Promise.resolve([]) : getProjectOptions(),
  ]);

  const open = tasks.filter((task) => task.status !== "done").length;
  const late = tasks.filter(
    (task) => task.status !== "done" && isOverdue(task.dueDate)
  ).length;

  return (
    <PageShell>
      <PageHeader
        title="Tasks"
        description={
          tasks.length === 0
            ? "Every task across every project, in one list."
            : `${open} open of ${tasks.length}${late > 0 ? ` Â· ${late} overdue` : ""}`
        }
        actions={
          isClient ? null : (
            <NewTaskButton
              projects={projects.map((project) => ({
                id: project.id,
                title: project.title,
              }))}
              initialOpen={params.new === "1"}
            />
          )
        }
      />
      <TasksTable
        tasks={tasks}
        projects={projects.map((project) => ({
          id: project.id,
          title: project.title,
        }))}
        isClient={isClient}
      />
    </PageShell>
  );
}
