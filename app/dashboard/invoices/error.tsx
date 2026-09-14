"use client";

import { ErrorState } from "@/components/app/error-state";

export default function InvoicesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Couldn't load invoices"
      description="No invoice data was changed. Something failed while reading the list."
      digest={error.digest}
      reset={reset}
    />
  );
}
