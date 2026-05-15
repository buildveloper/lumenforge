"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateInvoiceDialog } from "@/components/dashboard/create-invoice-dialog";

type InvoicesClientProps = {
  projectId?: string;
  showCreate?: boolean;
};

export function InvoicesClient({ projectId, showCreate = true }: InvoicesClientProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {showCreate && (
        <Button className="gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" />
          New Invoice
        </Button>
      )}
      <CreateInvoiceDialog
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
      />
    </>
  );
}
