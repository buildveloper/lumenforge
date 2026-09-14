import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// -- Users table --------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),

  // Nullable so the migration is safe on any database that already has rows.
  // A null hash means the account exists but cannot sign in with a password.
  passwordHash: text("password_hash"),

  role: text("role", { enum: ["user", "freelancer", "client", "admin"] })
    .notNull()
    .default("user"),

  // Notification preferences. Defaults mirror what the product did before these
  // were settable, except AI completion: nobody wants to be told about the
  // generation they just asked for.
  notifyProjectUpdates: integer("notify_project_updates", { mode: "boolean" })
    .notNull()
    .default(true),
  notifyTaskAssignments: integer("notify_task_assignments", { mode: "boolean" })
    .notNull()
    .default(true),
  notifyInvoiceStatus: integer("notify_invoice_status", { mode: "boolean" })
    .notNull()
    .default(true),
  notifyAiCompletion: integer("notify_ai_completion", { mode: "boolean" })
    .notNull()
    .default(false),

  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
});

// -- Notifications table -------------------------------------------------------
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// -- Sessions table -----------------------------------------------------------
// Backs sign-in. Only the SHA-256 of a token is stored, so a database leak does
// not hand over usable sessions.
export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)]
);

// -- API keys table -----------------------------------------------------------
export const apiKeys = sqliteTable("api_keys", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull().unique(),
  prefix: text("prefix").notNull(),
  lastUsedAt: text("last_used_at"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
});

// -- Clients table ------------------------------------------------------------
export const clients = sqliteTable(
  "clients",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    company: text("company"),
    phone: text("phone"),
    notes: text("notes"),

    // Set when the person this record describes signs in and claims it. Every
    // client-scoped read resolves through this, which is what makes the portal
    // work: previously client queries compared a clients.id against a Clerk id.
    clientUserId: text("client_user_id"),
    claimedAt: text("claimed_at"),

    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    index("clients_client_user_id_idx").on(table.clientUserId),
    index("clients_email_idx").on(table.email),
  ]
);

// -- Projects table -----------------------------------------------------------
export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => clients.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["active", "completed", "on_hold", "cancelled"],
  })
    .notNull()
    .default("active"),
  budget: integer("budget").default(0),
  dueDate: text("due_date"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
});

// -- Invoices table -----------------------------------------------------------
export const invoices = sqliteTable(
  "invoices",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    clientId: text("client_id").references(() => clients.id, {
      onDelete: "set null",
    }),
    projectId: text("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    // Unique per freelancer, not globally: every freelancer's first invoice is
    // INV-<year>-001. A global unique index meant only one account in the whole
    // system could ever hold that number.
    invoiceNumber: text("invoice_number").notNull(),
    status: text("status", {
      enum: ["draft", "sent", "paid", "overdue", "cancelled"],
    })
      .notNull()
      .default("draft"),
    amount: integer("amount").notNull().default(0),
    notes: text("notes"),
    dueDate: text("due_date"),
    paidAt: text("paid_at"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    deletedAt: text("deleted_at"),
  },
  (table) => [
    uniqueIndex("invoices_user_number_idx").on(table.userId, table.invoiceNumber),
  ]
);

// -- Tasks table --------------------------------------------------------------
export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  projectId: text("project_id").references(() => projects.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", {
    enum: ["todo", "in_progress", "review", "done"],
  })
    .notNull()
    .default("todo"),
  priority: text("priority", {
    enum: ["low", "medium", "high"],
  })
    .notNull()
    .default("medium"),
  assignee: text("assignee"),
  dueDate: text("due_date"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
});

// -- Activity logs table ------------------------------------------------------
export const activityLogs = sqliteTable("activity_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});
