"use client";

import { useEffect } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Last line of defence: this renders when the root layout itself fails, so it
 * has to bring its own html/body and cannot rely on providers.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[LumenForge] root layout failed:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "oklch(0.148 0.005 75)",
          color: "oklch(0.955 0.004 85)",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          padding: "1.5rem",
        }}
      >
        <div style={{ maxWidth: "26rem", textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <Logo />
          </div>
          <h1 style={{ fontSize: "15px", fontWeight: 600, margin: 0 }}>
            LumenForge couldn&rsquo;t start
          </h1>
          <p
            style={{
              marginTop: "0.5rem",
              fontSize: "13px",
              lineHeight: 1.6,
              color: "oklch(0.68 0.008 80)",
            }}
          >
            This is a failure in the app shell rather than anything you did. Your
            data is untouched. Reloading usually clears it.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "0.75rem",
                fontFamily: "ui-monospace, monospace",
                fontSize: "11px",
                color: "oklch(0.68 0.008 80)",
              }}
            >
              Ref {error.digest}
            </p>
          ) : null}
          <div style={{ marginTop: "1.25rem" }}>
            <Button onClick={reset} variant="outline">
              Reload
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
