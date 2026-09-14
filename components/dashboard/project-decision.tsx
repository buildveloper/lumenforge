"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MessageSquare } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { formatDateLong } from "@/lib/format";
import { recordProjectDecision } from "@/server/actions/project";

export type Decision = { action: string; createdAt: string } | null;

function decisionSummary(decision: Decision) {
  if (!decision) return null;
  const approved = decision.action === "project.approved";
  return {
    approved,
    label: approved ? "You approved this" : "You requested changes",
    date: formatDateLong(decision.createdAt),
  };
}

/**
 * The client's verdict. This used to be a `toast.success()` with nothing behind
 * it; it now writes to the audit trail and notifies the freelancer, so the state
 * shown here is read back from real records.
 */
export function ProjectDecision({
  projectId,
  decision,
}: {
  projectId: string;
  decision: Decision;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [pending, setPending] = useState<"approve" | "request_changes" | null>(null);
  const router = useRouter();

  const summary = decisionSummary(decision);

  async function submit(kind: "approve" | "request_changes", message?: string) {
    setPending(kind);
    try {
      await recordProjectDecision({
        projectId,
        decision: kind,
        note: message?.trim() || undefined,
      });
      toast.success(
        kind === "approve"
          ? "Approved. Your freelancer has been told."
          : "Change request sent."
      );
      setOpen(false);
      setNote("");
      router.refresh();
    } catch {
      toast.error("That didn't send. Try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {summary ? (
        <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
          <span
            className={
              summary.approved
                ? "size-1.5 rounded-full bg-positive"
                : "size-1.5 rounded-full bg-signal"
            }
          />
          {summary.label} · {summary.date}
        </span>
      ) : null}

      <Button
        size="sm"
        className="gap-2"
        onClick={() => submit("approve")}
        disabled={pending !== null}
      >
        <Check className="size-3.5" />
        {pending === "approve" ? "Recording…" : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(true)}
        disabled={pending !== null}
      >
        <MessageSquare className="size-3.5" />
        Request changes
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request changes</DialogTitle>
            <DialogDescription>
              Say what needs adjusting. Your freelancer gets this as a notification.
            </DialogDescription>
          </DialogHeader>

          <Field
            label="What needs to change?"
            htmlFor="change-note"
            optional
            hint="Specific notes get resolved faster than a general concern."
          >
            <Textarea
              id="change-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="The hero section still uses the old logo."
              maxLength={2000}
              rows={4}
              autoFocus
            />
          </Field>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => submit("request_changes", note)}
              disabled={pending !== null}
            >
              {pending === "request_changes" ? "Sending…" : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
