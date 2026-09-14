const DEFAULT_LOCALE = "en-US";

/**
 * SQLite `datetime('now')` returns "YYYY-MM-DD HH:MM:SS" in UTC with no offset,
 * which JS would otherwise read as local time. Date-only values ("YYYY-MM-DD")
 * must not be shifted by timezone at all.
 */
function parseDate(value: string): Date {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (dateOnly) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const hasOffset = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasOffset ? value : `${value.replace(" ", "T")}Z`);
}

const isDateOnly = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Money is stored as integer cents. */
export function formatMoney(
  cents: number | null | undefined,
  options: { decimals?: boolean; compact?: boolean; signed?: boolean } = {}
): string {
  const { decimals = false, compact = false, signed = false } = options;

  if (cents == null) return decimals ? "$0.00" : "$0";

  const value = cents / 100;
  const formatted = new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
    notation: compact ? "compact" : "standard",
  }).format(Math.abs(value));

  if (signed && value !== 0) return `${value < 0 ? "−" : "+"}${formatted}`;
  return value < 0 ? `−${formatted}` : formatted;
}

export function formatNumber(value: number, options: { compact?: boolean } = {}): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    notation: options.compact ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

/** "Jan 15" — the default for scannable lists and tables. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return parseDate(value).toLocaleDateString(DEFAULT_LOCALE, {
    month: "short",
    day: "numeric",
  });
}

/** "January 15, 2026" — detail views. */
export function formatDateLong(value: string | null | undefined): string {
  if (!value) return "—";
  return parseDate(value).toLocaleDateString(DEFAULT_LOCALE, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** "2026-01-15" — the only format an `<input type="date">` accepts. */
export function toDateInputValue(value: string | null | undefined): string {
  if (!value) return "";
  if (isDateOnly(value)) return value;
  return parseDate(value).toISOString().slice(0, 10);
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return "—";

  const then = parseDate(value).getTime();
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.round(days / 7)}w ago`;

  return formatDate(value);
}

/**
 * Deadlines are more actionable as a countdown than a date: "due in 12 days"
 * tells you whether to care; "Sep 26" makes you do arithmetic.
 */
export function formatDeadline(value: string | null | undefined): string {
  if (!value) return "No deadline";

  const due = parseDate(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const days = Math.round((due.getTime() - today.getTime()) / 86_400_000);

  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  if (days === -1) return "1 day overdue";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days <= 30) return `Due in ${days} days`;

  return `Due ${formatDate(value)}`;
}

export function isOverdue(value: string | null | undefined): boolean {
  if (!value) return false;
  const due = parseDate(value);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
}

/** Days overdue, for aging buckets. Zero when not overdue. */
export function daysOverdue(value: string | null | undefined): number {
  if (!value) return 0;
  const due = parseDate(value);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - due.getTime()) / 86_400_000);
  return days > 0 ? days : 0;
}

export function formatInitials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  if (parts.length === 0) return "?";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatStatusLabel(status: string): string {
  const spaced = status.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}
