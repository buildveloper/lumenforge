import { z } from "zod";

// -- Base helpers -------------------------------------------------------------

export const optionalString = z
  .string()
  .trim()
  .transform((v) => (v === "" ? undefined : v))
  .optional();

export const email = z.string().trim().email().max(255);

export const requiredString = z.string().trim().min(1);

// How much detail each field can carry. A client name is not a project brief.
const SHORT = 200;
const LONG = 2000;

// -- Pagination ---------------------------------------------------------------

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  // 100 rather than 50: the list pages ask for 60 so a full board or ledger
  // arrives in one request. The bound exists to stop a hand-rolled request
  // asking for everything at once.
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

// -- Auth ---------------------------------------------------------------------

/**
 * Length is the only rule worth enforcing. Composition requirements push people
 * toward predictable substitutions; a long passphrase is stronger and easier to
 * remember. The upper bound exists because scrypt hashes whatever it is given.
 */
export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(200, "That password is too long.");

export const signUpSchema = z.object({
  name: requiredString.max(120),
  email: email,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: email,
  // Deliberately not `passwordSchema`: never tell a sign-in attempt that the
  // password it guessed was the wrong *shape*.
  password: z.string().min(1).max(200),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// -- Role ---------------------------------------------------------------------

export const updateRoleSchema = z.object({
  role: z.enum(["freelancer", "client"]),
});

export const notificationPreferencesSchema = z.object({
  notifyProjectUpdates: z.boolean(),
  notifyTaskAssignments: z.boolean(),
  notifyInvoiceStatus: z.boolean(),
  notifyAiCompletion: z.boolean(),
});

// -- Client schemas -----------------------------------------------------------

export const createClientSchema = z.object({
  name: requiredString.max(SHORT),
  email: email.optional(),
  company: z.string().trim().max(SHORT).optional(),
  phone: z.string().trim().max(50).optional(),
  notes: z.string().max(LONG).optional(),
});

/** Nullable throughout so an edit can clear a field, not only set one. */
export const updateClientSchema = z.object({
  name: requiredString.max(SHORT).optional(),
  email: email.nullable().optional(),
  company: z.string().trim().max(SHORT).nullable().optional(),
  phone: z.string().trim().max(50).nullable().optional(),
  notes: z.string().max(LONG).nullable().optional(),
});

export const clientIdSchema = z.object({ clientId: requiredString });

// -- Project schemas ----------------------------------------------------------

export const createProjectSchema = z.object({
  clientId: z.string().optional(),
  title: requiredString.max(300),
  description: z.string().max(LONG).optional(),
  status: z
    .enum(["active", "completed", "on_hold", "cancelled"])
    .default("active"),
  budget: z.coerce.number().int().min(0).default(0),
  dueDate: z.string().optional(),
});

export const updateProjectSchema = z.object({
  clientId: z.string().nullable().optional(),
  title: requiredString.max(300).optional(),
  description: z.string().max(LONG).nullable().optional(),
  status: z.enum(["active", "completed", "on_hold", "cancelled"]).optional(),
  budget: z.coerce.number().int().min(0).optional(),
  dueDate: z.string().nullable().optional(),
});

export const projectIdSchema = z.object({ projectId: requiredString });

/** A client's verdict on a deliverable. Recorded, never silently applied. */
export const projectApprovalSchema = z.object({
  projectId: requiredString,
  decision: z.enum(["approve", "request_changes"]),
  note: z.string().max(LONG).optional(),
});

// -- Invoice schemas ----------------------------------------------------------

export const createInvoiceSchema = z.object({
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  status: z
    .enum(["draft", "sent", "paid", "overdue", "cancelled"])
    .default("draft"),
  amount: z.coerce.number().int().min(0).default(0),
  notes: z.string().max(LONG).optional(),
  dueDate: z.string().optional(),
});

export const updateInvoiceStatusSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
});

export const updateInvoiceSchema = z.object({
  amount: z.coerce.number().int().min(0).optional(),
  notes: z.string().max(LONG).nullable().optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]).optional(),
});

export const invoiceIdSchema = z.object({ invoiceId: requiredString });

// -- Task schemas -------------------------------------------------------------

export const createTaskSchema = z.object({
  projectId: z.string().optional(),
  title: requiredString.max(300),
  description: z.string().max(LONG).optional(),
  status: z
    .enum(["todo", "in_progress", "review", "done"])
    .optional()
    .default("todo"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  assignee: z.string().trim().max(100).optional(),
  dueDate: z.string().optional(),
});

export const updateTaskSchema = z.object({
  title: requiredString.max(300).optional(),
  description: z.string().max(LONG).nullable().optional(),
  status: z.enum(["todo", "in_progress", "review", "done"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  assignee: z.string().trim().max(100).nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(["todo", "in_progress", "review", "done"]),
});

export const taskIdSchema = z.object({ taskId: requiredString });

// -- Inferred types -----------------------------------------------------------

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type NotificationPreferencesInput = z.infer<
  typeof notificationPreferencesSchema
>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type ProjectApprovalInput = z.infer<typeof projectApprovalSchema>;
