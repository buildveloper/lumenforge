import { z } from "zod";

// -- Base helpers -------------------------------------------------------------

export const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const email = z.string().trim().email().max(255);

export const requiredString = z.string().trim().min(1);

export const url = z.string().trim().url();

// -- Pagination ---------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

// -- Role ---------------------------------------------------------------------

export const updateRoleSchema = z.object({
  role: z.enum(["freelancer", "client"]),
});

// -- Client schemas -----------------------------------------------------------

export const createClientSchema = z.object({
  name: requiredString.min(1).max(200),
  email: email.optional(),
  company: z.string().max(200).optional(),
  phone: z.string().max(50).optional(),
  notes: z.string().max(2000).optional(),
});

export const deleteClientSchema = z.object({
  clientId: requiredString,
});

// -- Project schemas ----------------------------------------------------------

export const createProjectSchema = z.object({
  clientId: z.string().optional(),
  title: requiredString.min(1).max(300),
  description: z.string().max(2000).optional(),
  status: z
    .enum(["active", "completed", "on_hold", "cancelled"])
    .default("active"),
  budget: z.coerce.number().int().min(0).default(0),
  dueDate: z.string().optional(),
});

export const deleteProjectSchema = z.object({
  projectId: requiredString,
});

export const updateProjectSchema = z.object({
  title: requiredString.min(1).max(300).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z
    .enum(["active", "completed", "on_hold", "cancelled"])
    .optional(),
  budget: z.coerce.number().int().min(0).optional(),
  dueDate: z.string().nullable().optional(),
});

// -- Invoice schemas ----------------------------------------------------------

export const createInvoiceSchema = z.object({
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  invoiceNumber: requiredString.min(1).max(50),
  status: z
    .enum(["draft", "sent", "paid", "overdue", "cancelled"])
    .default("draft"),
  amount: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
});

export const updateInvoiceSchema = z.object({
  amount: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(2000).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
});

// -- Task schemas -------------------------------------------------------------

export const createTaskSchema = z.object({
  projectId: z.string().optional(),
  title: requiredString.min(1).max(300),
  description: z.string().max(2000).optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional().default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignee: z.string().max(100).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: requiredString.min(1).max(300).optional(),
  description: z.string().max(2000).nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee: z.string().max(100).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "review", "done"]),
});

// -- API key ------------------------------------------------------------------

export const apiKeyCreateSchema = z.object({
  name: requiredString.max(100),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

// -- Inferred types -----------------------------------------------------------

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
