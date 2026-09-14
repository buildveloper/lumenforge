"use client";

import { ErrorState } from "@/components/app/error-state";

export default function InvoiceDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Couldn't load this invoice"
      description="The invoice is unchanged. Try again, or return to the list."
      digest={error.digest}
      reset={reset}
    />
  );
}
