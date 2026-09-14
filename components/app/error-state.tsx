"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * One error layout for the whole app. The previous build had two competing
 * boundaries with different copy, different layout, and different logging.
 * Errors are recovery paths: say what broke, then offer the way back.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "This is on our side, not yours. Try again, and if it keeps happening the error reference below will help.",
  digest,
  reset,
  scope = "page",
  className,
}: {
  title?: string;
  description?: string;
  digest?: string;
  reset?: () => void;
  scope?: "page" | "screen";
  className?: string;
}) {
  useEffect(() => {
    if (digest) {
      console.error(`[LumenForge] error boundary: ${title} (ref ${digest})`);
    } else {
      console.error(`[LumenForge] error boundary: ${title}`);
    }
  }, [title, digest]);

  return (
    <div
      className={cn(
        "flex items-center justify-center",
        scope === "screen" ? "min-h-[70vh] px-4" : "py-16",
        className
      )}
    >
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="mb-4 grid size-9 place-items-center rounded-full border border-negative/40 bg-negative/10">
          <svg
            viewBox="0 0 8 8"
            aria-hidden="true"
            className="size-2.5 text-negative"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 1.4v3.4M4 6.3v.3" />
          </svg>
        </span>
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
        <p className="mt-1.5 text-[13px] leading-5 text-muted-foreground">
          {description}
        </p>
        {digest ? (
          <p className="num mt-3 text-[11px] text-muted-foreground/70">
            Ref {digest}
          </p>
        ) : null}
        {reset ? (
          <Button variant="outline" size="sm" className="mt-5" onClick={reset}>
            Try again
          </Button>
        ) : null}
      </div>
    </div>
  );
}
