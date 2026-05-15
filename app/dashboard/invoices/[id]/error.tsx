"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function InvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center space-y-5 max-w-md">
        <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Failed to load invoice</h2>
          <p className="text-sm text-muted-foreground">
            We couldn&apos;t load this invoice. It may have been deleted or you may not have access.
          </p>
        </div>
        <Button onClick={reset} variant="outline">
          Try again
        </Button>
      </div>
    </div>
  );
}
