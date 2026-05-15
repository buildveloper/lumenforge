import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// -- Users table --------------------------------------------------------------
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  role: text("role", { enum: ["user", "freelancer", "client", "admin"] })
    .notNull()
    .default("user"),
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
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

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
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  company: text("company"),
  phone: text("phone"),
  notes: text("notes"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  deletedAt: text("deleted_at"),
});

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
export const invoices = sqliteTable("invoices", {
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
  invoiceNumber: text("invoice_number").notNull().unique(),
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
});

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
