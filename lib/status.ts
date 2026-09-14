import { formatStatusLabel } from "@/lib/format";

/**
 * Four tones, four glyphs. Colour is never the only carrier of meaning: every
 * status renders a glyph and a text label, so the chip survives deuteranopia,
 * protanopia, tritanopia, greyscale print, and a screenshot.
 */
export type StatusTone = "neutral" | "signal" | "positive" | "negative";

export type StatusDefinition = {
  tone: StatusTone;
  label: string;
};

const STATUS: Record<string, StatusDefinition> = {
  // projects
  active: { tone: "signal", label: "Active" },
  on_hold: { tone: "signal", label: "On hold" },
  completed: { tone: "positive", label: "Completed" },
  cancelled: { tone: "neutral", label: "Cancelled" },

  // invoices
  draft: { tone: "neutral", label: "Draft" },
  sent: { tone: "signal", label: "Sent" },
  paid: { tone: "positive", label: "Paid" },
  overdue: { tone: "negative", label: "Overdue" },

  // tasks
  todo: { tone: "neutral", label: "To do" },
  in_progress: { tone: "signal", label: "In progress" },
  review: { tone: "signal", label: "Review" },
  done: { tone: "positive", label: "Done" },

  // priorities
  low: { tone: "neutral", label: "Low" },
  medium: { tone: "signal", label: "Medium" },
  high: { tone: "negative", label: "High" },
};

export function getStatus(status: string | null | undefined): StatusDefinition {
  if (!status) return { tone: "neutral", label: "Unknown" };
  return STATUS[status] ?? { tone: "neutral", label: formatStatusLabel(status) };
}

/** Human-readable activity actions, single source. */
const ACTIVITY_LABEL: Record<string, string> = {
  "role.updated": "Changed account role",
  "client.created": "Added a client",
  "client.updated": "Updated a client",
  "client.deleted": "Removed a client",
  "project.created": "Started a project",
  "project.updated": "Updated a project",
  "project.deleted": "Archived a project",
  "project.approved": "Approved a project",
  "project.changes_requested": "Requested changes",
  "invoice.created": "Created an invoice",
  "invoice.updated": "Updated an invoice",
  "invoice.sent": "Sent an invoice",
  "invoice.paid": "Marked an invoice paid",
  "invoice.overdue": "Flagged an invoice overdue",
  "invoice.cancelled": "Cancelled an invoice",
  "invoice.deleted": "Deleted an invoice",
  "task.created": "Added a task",
  "task.updated": "Updated a task",
  "task.status_updated": "Moved a task",
  "task.deleted": "Deleted a task",
  "ai.generation": "Generated with AI",
};

export function getActivityLabel(action: string): string {
  return ACTIVITY_LABEL[action] ?? formatStatusLabel(action.replace(/\./g, " "));
}

/** Entity type → the rail section it belongs to, for activity icons and links. */
export const ACTIVITY_HREF: Record<string, string> = {
  client: "/dashboard/clients",
  project: "/dashboard/projects",
  invoice: "/dashboard/invoices",
  task: "/dashboard/tasks",
};
