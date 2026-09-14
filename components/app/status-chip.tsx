import { cn } from "@/lib/utils";
import { getStatus, type StatusTone } from "@/lib/status";

/**
 * Every status carries a glyph and a label, so meaning never depends on hue.
 * Survives greyscale, screenshots, and all three colourblind simulations.
 */
function Glyph({ tone }: { tone: StatusTone }) {
  if (tone === "neutral" || tone === "signal") {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "size-[7px] shrink-0 rounded-[1px]",
          tone === "neutral" ? "border border-current" : "bg-current"
        )}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 8 8"
      aria-hidden="true"
      className="size-[8px] shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tone === "positive" ? (
        <path d="M1.4 4.2 3.1 5.9 6.6 1.9" />
      ) : (
        <path d="M4 1.4v3.4M4 6.3v.3" />
      )}
    </svg>
  );
}

const toneClass: Record<StatusTone, string> = {
  neutral: "border-border-strong text-muted-foreground",
  signal: "border-signal/40 bg-signal-subtle text-signal",
  positive: "border-positive/40 bg-positive/10 text-positive",
  negative: "border-negative/45 bg-negative/10 text-negative",
};

export function StatusChip({
  status,
  className,
  showLabel = true,
}: {
  status: string | null | undefined;
  className?: string;
  showLabel?: boolean;
}) {
  const { tone, label } = getStatus(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 text-[11px] font-medium leading-4 whitespace-nowrap",
        toneClass[tone],
        className
      )}
    >
      <Glyph tone={tone} />
      {showLabel ? label : <span className="sr-only">{label}</span>}
    </span>
  );
}
