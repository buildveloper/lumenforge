"use server";

import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getGroqClient } from "@/lib/ai";
import { projects, tasks, invoices } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { logActivity } from "@/server/helpers/log-activity";

const generateSchema = z.object({
  projectId: z.string(),
  prompt: z.string().min(1).max(5000),
  type: z.enum([
    "proposal",
    "summary",
    "tasks",
    "description",
    "general",
  ]),
});

async function getProjectContext(projectId: string, userId: string) {
  const [project] = await db
    .select({
      title: projects.title,
      description: projects.description,
      status: projects.status,
      budget: projects.budget,
      dueDate: projects.dueDate,
    })
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId), isNull(projects.deletedAt)))
    .limit(1);

  if (!project) return null;

  const projectTasks = await db
    .select({
      title: tasks.title,
      status: tasks.status,
      priority: tasks.priority,
    })
    .from(tasks)
    .where(
      and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt))
    );

  const projectInvoices = await db
    .select({
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      amount: invoices.amount,
    })
    .from(invoices)
    .where(eq(invoices.projectId, projectId));

  return {
    project,
    tasks: projectTasks,
    invoices: projectInvoices,
  };
}

const SYSTEM_PROMPTS: Record<string, string> = {
  proposal: `You are a professional freelance proposal writer. Write a compelling project proposal based on the project context. Include: executive summary, scope of work, timeline, deliverables, and investment details. Format in clean markdown.`,
  summary: `You are a project management assistant. Write a concise but thorough progress summary based on the project context. Include: what's been done, current status, blockers, and next steps. Format in clean markdown.`,
  tasks: `You are a task breakdown specialist. Analyze the project context and suggest the next 5-10 tasks that should be completed. Include priority levels and estimated effort. Format as a structured task list in markdown.`,
  description: `You are a professional copywriter. Write a clear, detailed project or invoice description based on the project context. Make it professional and client-ready. Format in clean markdown.`,
  general: `You are a helpful AI assistant specialized in freelance project management. Help the user with their request based on the project context provided. Be concise and practical. Format in clean markdown.`,
};

export async function generateAIResponse(
  projectId: string,
  prompt: string,
  type: string
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = generateSchema.parse({ projectId, prompt, type });

  const context = await getProjectContext(parsed.projectId, userId);
  if (!context) throw new Error("Project not found");

  const systemPrompt = SYSTEM_PROMPTS[parsed.type] ?? SYSTEM_PROMPTS.general;

  const contextStr = `
Project: ${context.project.title}
Status: ${context.project.status}
Budget: ${context.project.budget != null ? `$${(context.project.budget / 100).toLocaleString()}` : "Not set"}
${context.project.description ? `Description: ${context.project.description}` : ""}
${context.project.dueDate ? `Deadline: ${context.project.dueDate}` : ""}

Tasks (${context.tasks.length} total):
${context.tasks.map((t) => `- [${t.status}] ${t.title} (${t.priority})`).join("\n")}

Invoices (${context.invoices.length} total):
${context.invoices.map((i) => `- ${i.invoiceNumber}: ${i.status} - $${(i.amount / 100).toLocaleString()}`).join("\n")}
`;

  try {
    const groq = getGroqClient();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Project Context:\n${contextStr}\n\nUser Request: ${parsed.prompt}` },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content ?? "";

    await logActivity({
      userId,
      action: "ai.generation",
      entityType: "project",
      entityId: parsed.projectId,
    });

    return { success: true, response };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "AI generation failed",
    };
  }
}
