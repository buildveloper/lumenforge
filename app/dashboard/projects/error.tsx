"use client";

import { ErrorState } from "@/components/app/error-state";

export default function ProjectsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Couldn't load projects"
      description="Your projects are still there. Something failed while reading them."
      digest={error.digest}
      reset={reset}
    />
  );
}
