import Link from "next/link";
import { Calendar, DollarSign, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  dueDate: string | null;
  projectTitle?: string | null;
  clientName?: string | null;
  createdAt: string;
};

export function InvoiceCard({ invoice }: { invoice: InvoiceRow }) {
  const party =
    invoice.clientName ?? invoice.projectTitle ?? "Invoice";

  return (
    <Link href={`/dashboard/invoices/${invoice.id}`}>
      <Card className="group border-border/40 bg-card/50 transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer">
        <CardContent className="flex items-center justify-between py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold tabular-nums group-hover:text-primary transition-colors">
                {invoice.invoiceNumber}
              </h3>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-muted-foreground truncate mt-1">
              {party}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm font-medium">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                {(invoice.amount / 100).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </span>
              {invoice.dueDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    "default" | "success" | "warning" | "destructive" | "outline"
  > = {
    draft: "outline",
    sent: "warning",
    paid: "success",
    overdue: "destructive",
    cancelled: "outline",
  };
  return (
    <Badge
      variant={variants[status] ?? "secondary"}
      className="text-xs capitalize"
    >
      {status}
    </Badge>
  );
}
