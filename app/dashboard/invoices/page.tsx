import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { InvoiceCard } from "@/components/dashboard/invoice-card";
import { InvoicesClient } from "./invoices-client";
import { InvoiceFilters } from "./invoice-filters";
import { getUserInvoices } from "@/server/actions/invoice";

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function InvoicesPage({ searchParams }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { status } = await searchParams;
  const { invoices, total } = await getUserInvoices(status ?? "all", {
    page: 1,
    limit: 50,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Invoices
          </h1>
          <p className="mt-1 text-muted-foreground">
            {total} invoice{total !== 1 ? "s" : ""}
          </p>
        </div>
        <InvoicesClient />
      </div>

      <InvoiceFilters currentStatus={status} />

      {invoices.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-6">
              <Receipt className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No invoices yet</h2>
            <p className="text-muted-foreground mb-8 max-w-sm">
              Create your first invoice to start getting paid.
            </p>
            <InvoicesClient />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <InvoiceCard key={invoice.id} invoice={invoice} />
          ))}
        </div>
      )}
    </div>
  );
}
