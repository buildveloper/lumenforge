import "server-only";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { invoices, projects, tasks } from "@/db/schema";
import { formatMoney } from "@/lib/format";

export const AI_TYPES = [
  "proposal",
  "summary",
  "tasks",
  "description",
  "general",
] as const;

export type AiType = (typeof AI_TYPES)[number];

export const SYSTEM_PROMPTS: Record<AiType, string> = {
  proposal: `You are a professional freelance proposal writer. Write a compelling project proposal based on the project context. Include: executive summary, scope of work, timeline, deliverables, and investment details. Use clean markdown with short paragraphs and concrete specifics from the context.`,
  summary: `You are a project management assistant. Write a concise progress summary based on the project context. Include: what's been done, current status, blockers, and next steps. Use clean markdown. Prefer specifics from the task and invoice lists over generic advice.`,
  tasks: `You are a task breakdown specialist. Analyse the project context and suggest the next 5-10 tasks. Give each a priority and a rough effort estimate. Format as a markdown list. Do not repeat tasks that already exist.`,
  description: `You are a professional copywriter. Write a clear, client-ready description for this project from the context provided. Use clean markdown. Avoid hype and filler.`,
  general: `You are an expert assistant for freelance project management. Answer the user's request using the project context provided. Be concise, specific, and practical. Use markdown.`,
};

export type ProjectContext = Awaited<ReturnType<typeof loadProjectContext>>;

/**
 * The AI is only useful if it reads the real project. This is the single place
 * that gathers what the model is allowed to see, scoped to the owner.
 */
export async function loadProjectContext(projectId: string, userId: string) {
  const [project] = await db
    .select({
      title: projects.title,
      description: projects.description,
      status: projects.status,
      budget: projects.budget,
      dueDate: projects.dueDate,
    })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.userId, userId),
        isNull(projects.deletedAt)
      )
    )
    .limit(1);

  if (!project) return null;

  const [projectTasks, projectInvoices] = await Promise.all([
    db
      .select({
        title: tasks.title,
        status: tasks.status,
        priority: tasks.priority,
      })
      .from(tasks)
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt))),
    db
      .select({
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        amount: invoices.amount,
      })
      .from(invoices)
      .where(and(eq(invoices.projectId, projectId), isNull(invoices.deletedAt))),
  ]);

  return { project, tasks: projectTasks, invoices: projectInvoices };
}

export function buildMessages(
  type: AiType,
  prompt: string,
  context: NonNullable<ProjectContext>
) {
  const { project } = context;

  const contextBlock = [
    `Project: ${project.title}`,
    `Status: ${project.status}`,
    `Budget: ${project.budget ? formatMoney(project.budget) : "Not set"}`,
    project.description ? `Scope on file: ${project.description}` : null,
    project.dueDate ? `Deadline: ${project.dueDate}` : null,
    "",
    `Tasks (${context.tasks.length}):`,
    context.tasks.length
      ? context.tasks.map((task) => `- [${task.status}] ${task.title} (${task.priority})`).join("\n")
      : "- none yet",
    "",
    `Invoices (${context.invoices.length}):`,
    context.invoices.length
      ? context.invoices
          .map(
            (invoice) =>
              `- ${invoice.invoiceNumber}: ${invoice.status}, ${formatMoney(invoice.amount, { decimals: true })}`
          )
          .join("\n")
      : "- none yet",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system" as const, content: SYSTEM_PROMPTS[type] },
    {
      role: "user" as const,
      content: `Project context:\n${contextBlock}\n\nRequest: ${prompt}`,
    },
  ];
}
