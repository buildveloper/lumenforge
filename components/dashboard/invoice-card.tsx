import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { StatusChip } from "@/components/app/status-chip";
import { Num } from "@/components/app/num";
import { formatDate, formatMoney } from "@/lib/format";

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
  const party = invoice.clientName ?? invoice.projectTitle ?? "Invoice";

  return (
    <Link href={`/dashboard/invoices/${invoice.id}`} className="block">
      <Card className="group transition-colors hover:border-border-strong hover:bg-surface-raised/40">
        <CardContent className="flex items-center justify-between gap-4 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <Num className="text-[14px] font-semibold">{invoice.invoiceNumber}</Num>
              <StatusChip status={invoice.status} />
            </div>
            <p className="mt-1 truncate text-[13px] text-muted-foreground">{party}</p>
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <div className="text-right">
              <Num className="block text-[14px] font-semibold">
                {formatMoney(invoice.amount, { decimals: true })}
              </Num>
              <span className="text-[11px] text-muted-foreground">
                {invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date"}
              </span>
            </div>
            <ArrowRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
