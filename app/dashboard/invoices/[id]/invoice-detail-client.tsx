"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateInvoiceStatus } from "@/server/actions/invoice";
import { toast } from "sonner";

type InvoiceDetailClientProps = {
  invoice: {
    id: string;
    status: string;
  };
};

export function InvoiceDetailClient({ invoice }: InvoiceDetailClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function markAsPaid() {
    setLoading(true);
    try {
      await updateInvoiceStatus(invoice.id, { status: "paid" });
      toast.success("Invoice marked as paid");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update"
      );
    } finally {
      setLoading(false);
    }
  }

  if (invoice.status === "paid") return null;

  return (
    <Button
      variant="default"
      size="sm"
      className="gap-2"
      onClick={markAsPaid}
      disabled={loading}
    >
      <CheckCircle className="h-4 w-4" />
      {loading ? "Processing..." : "Mark as Paid"}
    </Button>
  );
}
