"use client";

import { ErrorState } from "@/components/app/error-state";

export default function ProjectDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Couldn't load this project"
      description="The project, its tasks, and its invoices are unaffected. Try loading it again."
      digest={error.digest}
      reset={reset}
    />
  );
}
