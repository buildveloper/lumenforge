import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import {
  ArrowLeft,
  DollarSign,
  Calendar,
  Receipt,
  Download,
  Send,
  Building2,
  Mail,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { InvoiceDetailClient } from "./invoice-detail-client";
import { getInvoiceById } from "@/server/actions/invoice";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function InvoiceDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  let invoice;
  try {
    invoice = await getInvoiceById(id);
  } catch {
    notFound();
  }

  const partyName = invoice.clientName ?? invoice.projectTitle ?? "Client";
  const partyEmail = invoice.clientEmail ?? "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* -- Back */}
      <Button variant="ghost" size="sm" className="gap-2 mb-8" asChild>
        <Link href="/dashboard/invoices">
          <ArrowLeft className="h-4 w-4" />
          All Invoices
        </Link>
      </Button>

      {/* -- Invoice Header */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tabular-nums">
                {invoice.invoiceNumber}
              </h1>
            </div>
          </div>
          <StatusBadge status={invoice.status} />
        </div>

        <InvoiceDetailClient invoice={invoice} />
      </div>

      {/* -- Amount (big) */}
      <Card className="border-border/40 bg-card/50 mb-8">
        <CardContent className="flex flex-col items-center py-10">
          <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
            Total Amount
          </p>
          <p className="text-5xl font-bold tabular-nums tracking-tight">
            {(invoice.amount / 100).toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}
          </p>
          {invoice.dueDate && (
            <p className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Due{" "}
              {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        {/* -- Bill To */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Bill To
          </p>
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-semibold">{partyName}</p>
              {partyEmail && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {partyEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* -- Dates */}
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Details
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>
                {new Date(invoice.createdAt).toLocaleDateString()}
              </span>
            </div>
            {invoice.dueDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}
            {invoice.paidAt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid</span>
                <span className="text-success font-medium">
                  {new Date(invoice.paidAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {invoice.projectTitle && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Project</span>
                <span className="truncate max-w-[160px]">
                  {invoice.projectTitle}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -- Notes / Line Items */}
      {invoice.notes && (
        <>
          <Separator className="mb-6" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
              Notes / Line Items
            </p>
            <Card className="border-border/40 bg-card/50">
              <CardContent className="py-4">
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                  {invoice.notes}
                </pre>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* -- Action Buttons */}
      <Separator className="my-8" />

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm" className="gap-2" disabled>
          <Send className="h-4 w-4" />
          Send Reminder
        </Button>
        {invoice.status !== "paid" && (
          <InvoiceDetailClient invoice={invoice} />
        )}
      </div>
    </div>
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
      className="text-sm capitalize px-3 py-1 mt-2"
    >
      {status}
    </Badge>
  );
}
