"use client";

import { ErrorState } from "@/components/app/error-state";

export default function ActivityError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Couldn't load activity"
      description="The audit trail is intact. Something failed while reading it."
      digest={error.digest}
      reset={reset}
    />
  );
}
