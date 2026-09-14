import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Mail } from "lucide-react";

import { Breadcrumbs } from "@/components/app/breadcrumbs";
import { CopyButton } from "@/components/app/copy-button";
import { Num } from "@/components/app/num";
import { PageShell } from "@/components/app/page-shell";
import { StatusChip } from "@/components/app/status-chip";
import { InvoiceDetailActions } from "@/components/dashboard/invoice-detail-actions";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  daysOverdue,
  formatDateLong,
  formatMoney,
} from "@/lib/format";
import { getInvoiceById } from "@/server/actions/invoice";
import { getProfile } from "@/server/actions/user";
import { cn } from "@/lib/utils";

type Props = {
  params: Promise<{ id: string }>;
};

function DetailRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 last:border-b-0">
      <span className="shrink-0 text-[12px] text-muted-foreground">{label}</span>
      <span className={cn("min-w-0 truncate text-right text-[13px]", mono && "num")}>
        {children}
      </span>
    </div>
  );
}

export default async function InvoiceDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const profile = await getProfile();
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";

  let invoice;
  try {
    invoice = await getInvoiceById(id);
  } catch {
    notFound();
  }

  const party = invoice.clientName ?? invoice.projectTitle ?? "Client";
  const late = invoice.status === "overdue";
  const days = daysOverdue(invoice.dueDate);

  return (
    <PageShell width="narrow">
      <Breadcrumbs
        items={[
          { label: "Workspace", href: "/dashboard" },
          { label: "Invoices", href: "/dashboard/invoices" },
          { label: invoice.invoiceNumber },
        ]}
      />

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="num text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            {invoice.invoiceNumber}
          </h1>
          <StatusChip status={invoice.status} className="text-[12px]" />
        </div>

        {isClient ? null : (
          <InvoiceDetailActions
            invoice={{
              id: invoice.id,
              invoiceNumber: invoice.invoiceNumber,
              amount: invoice.amount,
              status: invoice.status,
              notes: invoice.notes,
              dueDate: invoice.dueDate,
            }}
          />
        )}
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card px-6 py-10">
        <div className="flex flex-col items-center text-center">
          <span className="text-[11px] font-medium text-muted-foreground">
            {invoice.status === "paid" ? "Paid" : "Total due"}
          </span>
          <Num
            className={cn(
              "mt-2 text-[40px] font-semibold leading-none tracking-[-0.03em] sm:text-[48px]",
              invoice.status === "paid" ? "text-positive" : "text-foreground"
            )}
          >
            {formatMoney(invoice.amount, { decimals: true })}
          </Num>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
            {invoice.dueDate ? (
              <Num>
                {late && days > 0
                  ? `${days} days past due`
                  : `Due ${formatDateLong(invoice.dueDate)}`}
              </Num>
            ) : (
              <span>No due date set</span>
            )}
            {invoice.paidAt ? (
              <Num className="text-positive">
                Paid {formatDateLong(invoice.paidAt)}
              </Num>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="mb-2 text-[11px] font-medium text-muted-foreground">
            Billed to
          </h2>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-sm border border-border bg-surface-sunken text-muted-foreground">
              <Building2 className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{party}</p>
              {invoice.clientEmail ? (
                <p className="flex items-center gap-1 text-[12px] text-muted-foreground">
                  <Mail className="size-3" />
                  <span className="truncate">{invoice.clientEmail}</span>
                  <CopyButton value={invoice.clientEmail} className="size-5" />
                </p>
              ) : (
                <p className="text-[12px] text-muted-foreground">
                  No email on record. Add one to the client so reminders can reach them.
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-[11px] font-medium text-muted-foreground">
            Details
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-1">
            <DetailRow label="Created" mono>
              {formatDateLong(invoice.createdAt)}
            </DetailRow>
            {invoice.dueDate ? (
              <DetailRow label="Due" mono>
                {formatDateLong(invoice.dueDate)}
              </DetailRow>
            ) : null}
            {invoice.paidAt ? (
              <DetailRow label="Paid" mono>
                {formatDateLong(invoice.paidAt)}
              </DetailRow>
            ) : null}
            {invoice.projectTitle ? (
              <DetailRow label="Project">
                {invoice.projectId ? (
                  <Link
                    href={`/dashboard/projects/${invoice.projectId}`}
                    className="text-signal hover:underline"
                  >
                    {invoice.projectTitle}
                  </Link>
                ) : (
                  invoice.projectTitle
                )}
              </DetailRow>
            ) : null}
          </div>
        </section>
      </div>

      {invoice.notes ? (
        <section className="mt-6">
          <h2 className="mb-2 text-[11px] font-medium text-muted-foreground">
            Line items
          </h2>
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <p className="whitespace-pre-wrap text-[13px] leading-6 text-muted-foreground">
              {invoice.notes}
            </p>
          </div>
        </section>
      ) : null}

      <Separator className="my-8" />

      <Button variant="ghost" size="sm" className="gap-2" asChild>
        <Link href="/dashboard/invoices">
          <ArrowLeft className="size-3.5" />
          All invoices
        </Link>
      </Button>
    </PageShell>
  );
}
