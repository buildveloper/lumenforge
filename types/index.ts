export type Role = "user" | "freelancer" | "client" | "admin";

export type ProjectStatus = "active" | "completed" | "on_hold" | "cancelled";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";
export type TaskStatus = "todo" | "in_progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type User = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: Role;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Client = {
  id: string;
  userId: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  userId: string;
  clientId: string | null;
  title: string;
  description: string | null;
  status: ProjectStatus;
  budget: number;
  dueDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  userId: string;
  clientId: string | null;
  projectId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  amount: number;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Task = {
  id: string;
  userId: string;
  projectId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string | null;
  dueDate: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  type: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

export type RateLimitEntry = {
  count: number;
  resetAt: number;
};
