"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(
      "[LumenForge] Dashboard error boundary caught:",
      error.message,
      error.digest ? `(digest: ${error.digest})` : "",
      error.stack
    );
  }, [error]);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-5 max-w-md">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Something went wrong</h2>
            <p className="text-sm text-muted-foreground">
              We encountered an error loading your dashboard. This might be a temporary issue — please try refreshing.
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground/60 font-mono">
                Ref: {error.digest}
              </p>
            )}
          </div>
          <Button onClick={reset} variant="outline">
            Refresh page
          </Button>
        </div>
      </div>
    </div>
  );
}
