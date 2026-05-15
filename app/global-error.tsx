"use client";

import { Button } from "@/components/ui/button";
import { Briefcase, AlertTriangle } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Briefcase className="h-8 w-8 text-primary" />
              <span className="text-2xl font-semibold tracking-tight">LumenForge</span>
            </div>

            <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold">Something went wrong</h1>
              <p className="text-sm text-muted-foreground">
                A critical error occurred. Please try refreshing the page. If the problem persists, contact support.
              </p>
            </div>

            <Button onClick={reset} variant="outline" size="lg">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
