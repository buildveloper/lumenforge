"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Field, describedBy } from "@/components/app/field";
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
import { Textarea } from "@/components/ui/textarea";
import { createClient, updateClient } from "@/server/actions/client";

export type ClientFormValues = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  phone: string | null;
  notes: string | null;
};

/**
 * The fields live in a child rendered *inside* `DialogContent`, which Radix
 * unmounts on close. That resets every field on reopen without an effect that
 * copies props into state.
 */
export function ClientFormDialog({
  open,
  onOpenChange,
  client,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: ClientFormValues;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <ClientForm client={client} onOpenChange={onOpenChange} />
      </DialogContent>
    </Dialog>
  );
}

function ClientForm({
  client,
  onOpenChange,
}: {
  client?: ClientFormValues;
  onOpenChange: (open: boolean) => void;
}) {
  const editing = Boolean(client);
  const router = useRouter();

  const [name, setName] = useState(client?.name ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [company, setCompany] = useState(client?.company ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [notes, setNotes] = useState(client?.notes ?? "");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      setError("A name is required so you know who this is.");
      return;
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("That email doesn't look right.");
      return;
    }

    setSaving(true);
    setError(undefined);

    try {
      if (editing && client) {
        await updateClient({
          clientId: client.id,
          values: {
            name: name.trim(),
            email: email.trim() || null,
            company: company.trim() || null,
            phone: phone.trim() || null,
            notes: notes.trim() || null,
          },
        });
        toast.success("Client updated");
      } else {
        await createClient({
          name: name.trim(),
          email: email.trim() || undefined,
          company: company.trim() || undefined,
          phone: phone.trim() || undefined,
          notes: notes.trim() || undefined,
        });
        toast.success(`${name.trim()} added`);
      }
      onOpenChange(false);
      router.refresh();
    } catch {
      setSaving(false);
      toast.error(
        editing
          ? "Couldn't save. Your edits are still in the form."
          : "Couldn't add the client. Try again."
      );
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{editing ? "Edit client" : "New client"}</DialogTitle>
        <DialogDescription>
          {editing
            ? "Keep contact details current so invoices reach the right inbox."
            : "The email address is how a client claims their portal access."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <Field label="Name" htmlFor="client-name" error={error}>
          <Input
            id="client-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Alex Moreau"
            maxLength={200}
            autoFocus
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy("client-name", error)}
          />
        </Field>

        <Field
          label="Email"
          htmlFor="client-email"
          optional
          hint="Used to match their account when they sign up."
        >
          <Input
            id="client-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="alex@studio.com"
            maxLength={255}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Company" htmlFor="client-company" optional>
            <Input
              id="client-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="Studio Moreau"
              maxLength={200}
            />
          </Field>

          <Field label="Phone" htmlFor="client-phone" optional>
            <Input
              id="client-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+1 555 0100"
              maxLength={50}
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="client-notes" optional>
          <Textarea
            id="client-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Preferred contact hours, billing entity, anything worth remembering."
            maxLength={2000}
            rows={3}
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
                : "Adding…"
              : editing
                ? "Save changes"
                : "Add client"}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
