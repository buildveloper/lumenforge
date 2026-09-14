"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field } from "@/components/app/field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toDateInputValue } from "@/lib/format";
import { createInvoice, updateInvoice } from "@/server/actions/invoice";

export type InvoiceOption = { id: string; label: string };

export type InvoiceFormValues = {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  notes: string | null;
  dueDate: string | null;
};

const NO_PROJECT = "__none__";
const NO_CLIENT = "__none__";

export function InvoiceFormDialog({
  open,
  onOpenChange,
  projects = [],
  clients = [],
  projectId,
  invoice,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects?: InvoiceOption[];
  clients?: InvoiceOption[];
  projectId?: string;
  invoice?: InvoiceFormValues;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <InvoiceForm
          projects={projects}
          clients={clients}
          projectId={projectId}
          invoice={invoice}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}

function InvoiceForm({
  projects = [],
  clients = [],
  projectId,
  invoice,
  onOpenChange,
}: {
  projects?: InvoiceOption[];
  clients?: InvoiceOption[];
  projectId?: string;
  invoice?: InvoiceFormValues;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = Boolean(invoice);
  const router = useRouter();

  const [amount, setAmount] = useState(
    invoice ? String(invoice.amount / 100) : ""
  );
  const [dueDate, setDueDate] = useState(
    toDateInputValue(invoice?.dueDate ?? null)
  );
  const [notes, setNotes] = useState(invoice?.notes ?? "");
  const [status, setStatus] = useState(invoice?.status ?? "draft");
  const [project, setProject] = useState(projectId ?? NO_PROJECT);
  const [client, setClient] = useState(NO_CLIENT);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const parsedAmount = Number.parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      if (editing && invoice) {
        await updateInvoice(invoice.id, {
          amount: Math.round(parsedAmount * 100),
          status: status as "draft" | "sent" | "paid" | "overdue" | "cancelled",
          notes: notes.trim() || null,
          dueDate: dueDate || null,
        });
        toast.success(`${invoice.invoiceNumber} updated`);
      } else {
        const result = await createInvoice({
          amount: Math.round(parsedAmount * 100),
          status: "draft",
          notes: notes.trim() || undefined,
          dueDate: dueDate || undefined,
          projectId: project === NO_PROJECT ? undefined : project,
          clientId: client === NO_CLIENT ? undefined : client,
        });
        toast.success(`${result.invoiceNumber} created`);
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      setSaving(false);
      toast.error(
        editing
          ? "Couldn't save the invoice. Your edits are still in the form."
          : "Couldn't create the invoice. Try again."
      );
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit invoice" : "New invoice"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Adjust the amount, due date, or line items."
            : "The invoice number is assigned automatically from your own sequence."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4">
          <Field
            label="Amount"
            htmlFor="invoice-amount"
            error={error}
            hint="Dollars, not cents."
          >
            <Input
              id="invoice-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="2500.00"
              autoFocus
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "invoice-amount-error" : "invoice-amount-hint"}
            />
          </Field>

          {!editing && projects.length > 0 && !projectId ? (
            <Field
              label="Project"
              htmlFor="invoice-project"
              optional
              hint="Linking a project lets its client see this invoice."
            >
              <Select value={project} onValueChange={setProject}>
                <SelectTrigger id="invoice-project">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PROJECT}>No project</SelectItem>
                  {projects.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          {!editing && clients.length > 0 ? (
            <Field
              label="Client"
              htmlFor="invoice-client"
              optional
              hint="Required if the invoice isn't attached to a project."
            >
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger id="invoice-client">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_CLIENT}>No client</SelectItem>
                  {clients.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Due date" htmlFor="invoice-due" optional>
              <Input
                id="invoice-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </Field>

            {editing ? (
              <Field label="Status" htmlFor="invoice-status">
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="invoice-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </div>

          <Field
            label="Line items"
            htmlFor="invoice-notes"
            optional
            hint="One per line. These are what the client reads on the invoice."
          >
            <Textarea
              id="invoice-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={"Website design — $1,800\nBrand assets — $700"}
              maxLength={2000}
              rows={4}
            />
          </Field>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? editing
                  ? "Saving…"
                  : "Creating…"
                : editing
                  ? "Save changes"
                  : "Create invoice"}
            </Button>
          </DialogFooter>
      </form>
    </>
  );
}
