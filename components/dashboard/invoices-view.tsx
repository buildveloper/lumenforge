"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpDown, Check, MoreHorizontal, Pencil, Plus, Receipt, Trash2 } from "lucide-react";

import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { StatusChip } from "@/components/app/status-chip";
import { withUndo } from "@/components/app/with-undo";
import {
  InvoiceFormDialog,
  type InvoiceOption,
} from "@/components/dashboard/invoice-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { daysOverdue, formatDate, formatMoney } from "@/lib/format";
import {
  restoreInvoice,
  softDeleteInvoice,
  updateInvoiceStatus,
} from "@/server/actions/invoice";
import { cn } from "@/lib/utils";

export type InvoiceRow = {
  id: string;
  invoiceNumber: string;
  status: string;
  amount: number;
  notes: string | null;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  projectId: string | null;
  clientId: string | null;
  projectTitle: string | null;
  clientName: string | null;
};

type SortKey = "created" | "due" | "amount";

/** Declared at module scope: a component created during render resets its state. */
function SortHeader({
  label,
  sortKey,
  active,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-label={`Sort by ${label}`}
        className={cn(
          "col-head inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active && "text-foreground"
        )}
      >
        {label}
        <ArrowUpDown className="size-3" />
      </button>
    </TableHead>
  );
}

export function NewInvoiceButton({
  clients = [],
  projects = [],
  projectId,
  label = "New invoice",
  initialOpen = false,
}: {
  clients?: InvoiceOption[];
  projects?: InvoiceOption[];
  projectId?: string;
  label?: string;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {label}
      </Button>
      <InvoiceFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            if (initialOpen) router.replace("/dashboard/invoices");
            router.refresh();
          }
        }}
        clients={clients}
        projects={projects}
        projectId={projectId}
      />
    </>
  );
}

export function InvoicesTable({
  invoices,
  emptyDescription,
}: {
  invoices: InvoiceRow[];
  emptyDescription?: string;
}) {
  const [sort, setSort] = useState<SortKey>("created");
  const [editing, setEditing] = useState<InvoiceRow | null>(null);
  const router = useRouter();

  const sorted = useMemo(() => {
    const rows = [...invoices];
    if (sort === "amount") rows.sort((a, b) => b.amount - a.amount);
    if (sort === "due") {
      rows.sort((a, b) => (a.dueDate ?? "9999").localeCompare(b.dueDate ?? "9999"));
    }
    return rows;
  }, [invoices, sort]);

  if (invoices.length === 0) {
    return (
      <EmptyState
        icon={Receipt}
        title="No invoices here"
        description={
          emptyDescription ??
          "Raise an invoice and it gets numbered from your own sequence. Status moves from draft through sent to paid."
        }
        action={<NewInvoiceButton />}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[15%]">Invoice</TableHead>
              <TableHead className="w-[27%]">Billed to</TableHead>
              <SortHeader
                label="Due"
                sortKey="due"
                active={sort === "due"}
                onSort={setSort}
                className="hidden w-[14%] sm:table-cell"
              />
              <TableHead className="w-[13%] hidden sm:table-cell">Status</TableHead>
              <SortHeader
                label="Amount"
                sortKey="amount"
                active={sort === "amount"}
                onSort={setSort}
                className="w-[17%] text-right"
              />
              <TableHead className="w-[8%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((invoice) => {
              const late = invoice.status === "overdue";
              const days = daysOverdue(invoice.dueDate);

              return (
                <TableRow key={invoice.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/invoices/${invoice.id}`}
                      className="block"
                    >
                      <Num className="text-[13px] font-medium">
                        {invoice.invoiceNumber}
                      </Num>
                      <span className="block text-[11px] text-muted-foreground sm:hidden">
                        {invoice.status}
                      </span>
                    </Link>
                  </TableCell>

                  <TableCell>
                    <span className="block truncate text-[13px]">
                      {invoice.clientName ?? invoice.projectTitle ?? "—"}
                    </span>
                    {invoice.clientName && invoice.projectTitle ? (
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {invoice.projectTitle}
                      </span>
                    ) : null}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <Num className="block text-[12px]">
                      {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                    </Num>
                    {late && days > 0 ? (
                      <span className="block text-[11px] text-negative">
                        {days} days late
                      </span>
                    ) : null}
                  </TableCell>

                  <TableCell className="hidden sm:table-cell">
                    <StatusChip status={invoice.status} />
                  </TableCell>

                  <TableCell className="text-right">
                    <Num
                      className={cn(
                        "block text-[13px] font-medium",
                        late && "text-negative"
                      )}
                    >
                      {formatMoney(invoice.amount, { decimals: true })}
                    </Num>
                    <span className="block text-[11px] text-muted-foreground sm:hidden">
                      {invoice.dueDate ? `Due ${formatDate(invoice.dueDate)}` : "No due date"}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Actions for ${invoice.invoiceNumber}`}
                            className="text-muted-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invoice.status !== "paid" ? (
                            <DropdownMenuItem
                              onSelect={() => {
                                void updateInvoiceStatus(invoice.id, {
                                  status: "paid",
                                }).then(() => {
                                  router.refresh();
                                });
                              }}
                            >
                              <Check />
                              Mark as paid
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuItem onSelect={() => setEditing(invoice)}>
                            <Pencil />
                            Edit invoice
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            tone="danger"
                            onSelect={() => {
                              void withUndo({
                                message: `${invoice.invoiceNumber} deleted`,
                                remove: () => softDeleteInvoice(invoice.id),
                                undo: () => restoreInvoice(invoice.id),
                                restoredMessage: `${invoice.invoiceNumber} restored`,
                              }).then((ok) => {
                                if (ok) router.refresh();
                              });
                            }}
                          >
                            <Trash2 />
                            Delete invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <InvoiceFormDialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null);
            router.refresh();
          }
        }}
        invoice={
          editing
            ? {
                id: editing.id,
                invoiceNumber: editing.invoiceNumber,
                amount: editing.amount,
                status: editing.status,
                notes: editing.notes,
                dueDate: editing.dueDate,
              }
            : undefined
        }
      />
    </>
  );
}
