import Link from "next/link";

import { Num } from "@/components/app/num";
import { cn } from "@/lib/utils";

/**
 * URL-driven filters rather than client state: shareable, and they keep working
 * with JavaScript off. Counts come from the server so the control reports what
 * is behind each option.
 */
export function FilterLinks({
  options,
  current,
  basePath,
  paramName = "status",
}: {
  options: { value: string; label: string; count?: number }[];
  current: string;
  basePath: string;
  paramName?: string;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto pb-1 scroll-thin">
      {options.map((option) => {
        const active = option.value === current;
        const href =
          option.value === "all"
            ? basePath
            : `${basePath}?${paramName}=${encodeURIComponent(option.value)}`;

        return (
          <Link
            key={option.value}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[12px] font-medium transition-colors",
              "[@media(pointer:coarse)]:min-h-9",
              active
                ? "border-border-strong bg-card text-foreground"
                : "border-transparent text-muted-foreground hover:bg-surface-raised/60 hover:text-foreground"
            )}
          >
            {option.label}
            {option.count != null ? (
              <Num className="text-[11px] text-muted-foreground">{option.count}</Num>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
