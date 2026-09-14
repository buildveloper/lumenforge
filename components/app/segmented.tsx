"use client";

import { m } from "motion/react";

import { Num } from "@/components/app/num";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 400, damping: 32 };

/**
 * A filter that reports counts, so the control tells you what is behind each
 * option instead of making you click to find out.
 */
export function Segmented<T extends string>({
  id,
  options,
  value,
  onChange,
  className,
}: {
  /** Unique per instance: two segmented controls must not share an indicator. */
  id: string;
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label="Filter"
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md border border-border bg-surface-sunken p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative rounded-sm px-2.5 py-1 text-[12px] font-medium transition-colors",
              "[@media(pointer:coarse)]:min-h-9 [@media(pointer:coarse)]:px-3",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active ? (
              <m.span
                layoutId={`segmented-${id}`}
                className="absolute inset-0 rounded-sm border border-border bg-card"
                transition={spring}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {option.label}
              {option.count != null ? (
                <Num className="text-[11px] text-muted-foreground">
                  {option.count}
                </Num>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
