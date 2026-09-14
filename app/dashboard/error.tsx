"use client";

import { ErrorState } from "@/components/app/error-state";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      scope="screen"
      title="Couldn't load your workspace"
      description="Nothing has been lost. This is a loading failure, so try again, and if it repeats the reference below identifies it."
      digest={error.digest}
      reset={reset}
    />
  );
}
