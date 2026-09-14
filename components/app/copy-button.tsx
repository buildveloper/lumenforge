"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success(`${label === "Copy" ? "Copied" : `${label} copied`}`);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Couldn't reach the clipboard. Select the text and copy it manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`${label} to clipboard`}
      className={cn(
        "grid size-7 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground",
        className
      )}
    >
      {copied ? (
        <Check className="size-3.5 text-positive" />
      ) : (
        <Copy className="size-3.5" />
      )}
    </button>
  );
}
