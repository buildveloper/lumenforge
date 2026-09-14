"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, m } from "motion/react";
import { Check, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { withUndo } from "@/components/app/with-undo";
import {
  InvoiceFormDialog,
  type InvoiceFormValues,
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
  restoreInvoice,
  softDeleteInvoice,
  updateInvoiceStatus,
} from "@/server/actions/invoice";

/**
 * The one moment in the product worth animating: money arriving. The spinner
 * resolves into a drawn check rather than snapping, so the state change reads as
 * an event instead of a re-render.
 */
function DrawnCheck() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden="true" fill="none">
      <m.path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  );
}

export function InvoiceDetailActions({
  invoice,
}: {
  invoice: InvoiceFormValues;
}) {
  const [state, setState] = useState<"idle" | "saving" | "paid">(
    invoice.status === "paid" ? "paid" : "idle"
  );
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  async function markPaid() {
    setState("saving");
    try {
      await updateInvoiceStatus(invoice.id, { status: "paid" });
      setState("paid");
      toast.success(`${invoice.invoiceNumber} marked paid`);
      router.refresh();
    } catch {
      setState("idle");
      toast.error("Couldn't update the invoice. It is unchanged.");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {state === "paid" ? (
        <span className="inline-flex h-9 items-center gap-2 rounded-md border border-positive/40 bg-positive/10 px-3.5 text-[13px] font-medium text-positive">
          <DrawnCheck />
          Paid
        </span>
      ) : (
        <Button
          onClick={markPaid}
          disabled={state === "saving"}
          className="min-w-[10rem] gap-2"
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === "saving" ? (
              <m.span
                key="saving"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.08 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </m.span>
            ) : (
              <m.span
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.08 }}
                className="flex items-center gap-2"
              >
                <Check className="size-4" />
                Mark as paid
              </m.span>
            )}
          </AnimatePresence>
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="More invoice actions">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setEditing(true)}>
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
                if (ok) router.push("/dashboard/invoices");
              });
            }}
          >
            <Trash2 />
            Delete invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <InvoiceFormDialog
        open={editing}
        onOpenChange={(next) => {
          setEditing(next);
          if (!next) router.refresh();
        }}
        invoice={invoice}
      />
    </div>
  );
}
