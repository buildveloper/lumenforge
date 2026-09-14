import { cn } from "@/lib/utils";

export type BarDatum = {
  label: string;
  /** Primary series — rendered as a filled bar. */
  value: number;
  /** Optional secondary series — rendered as a cap on the same bar. */
  compare?: number;
};

/**
 * Dependency-free SVG bars. Deliberately not Recharts: this needs ~2kb, not
 * ~100kb, and a hand-drawn chart keeps the tokens honest. Every chart ships a
 * table equivalent so the data is reachable without seeing colour.
 */
export function BarChart({
  data,
  formatValue,
  primaryLabel,
  compareLabel,
  className,
}: {
  data: BarDatum[];
  formatValue: (value: number) => string;
  primaryLabel: string;
  compareLabel?: string;
  className?: string;
}) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.compare ?? 0)));

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[1px] bg-signal" />
          {primaryLabel}
        </span>
        {compareLabel ? (
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[1px] bg-positive" />
            {compareLabel}
          </span>
        ) : null}
      </div>

      <div
        className="flex h-32 items-end gap-1.5"
        role="img"
        aria-label={data
          .map(
            (d) =>
              `${d.label}: ${formatValue(d.value)}${d.compare != null ? ` ${primaryLabel.toLowerCase()}, ${formatValue(d.compare)} ${compareLabel?.toLowerCase()}` : ""}`
          )
          .join(". ")}
      >
        {data.map((datum) => {
          const height = Math.max(2, Math.round((datum.value / max) * 100));
          const compareHeight =
            datum.compare != null
              ? Math.max(2, Math.round((datum.compare / max) * 100))
              : null;

          return (
            <div
              key={datum.label}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <div className="relative flex h-full w-full items-end justify-center">
                <div
                  className="w-full max-w-9 rounded-t-[3px] bg-signal/25"
                  style={{ height: `${height}%` }}
                />
                {compareHeight != null ? (
                  <div
                    className="absolute bottom-0 w-full max-w-9 rounded-t-[3px] bg-positive"
                    style={{ height: `${compareHeight}%` }}
                  />
                ) : null}
              </div>
              <span className="text-[10px] text-muted-foreground">{datum.label}</span>
            </div>
          );
        })}
      </div>

      <table className="sr-only">
        <caption>{primaryLabel} by month</caption>
        <thead>
          <tr>
            <th scope="col">Month</th>
            <th scope="col">{primaryLabel}</th>
            {compareLabel ? <th scope="col">{compareLabel}</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((datum) => (
            <tr key={datum.label}>
              <th scope="row">{datum.label}</th>
              <td>{formatValue(datum.value)}</td>
              {compareLabel ? <td>{datum.compare != null ? formatValue(datum.compare) : "—"}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A single-series trend line for dense headers. */
export function Sparkline({
  values,
  label,
  className,
}: {
  values: number[];
  label: string;
  className?: string;
}) {
  if (values.length < 2) return null;

  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 28;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      role="img"
      aria-label={label}
      className={cn("h-8 w-full text-signal", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
