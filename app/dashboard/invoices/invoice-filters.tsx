import Link from "next/link";
import { cn } from "@/lib/utils";

const filters = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Sent", value: "sent" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
];

type InvoiceFiltersProps = {
  currentStatus?: string;
};

export function InvoiceFilters({ currentStatus }: InvoiceFiltersProps) {
  const active = currentStatus ?? "all";

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
      {filters.map((f) => (
        <Link
          key={f.value}
          href={f.value === "all" ? "/dashboard/invoices" : `?status=${f.value}`}
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
            active === f.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          )}
        >
          {f.label}
        </Link>
      ))}
    </div>
  );
}
