import Link from "next/link";
import { cn } from "@/lib/utils";
import { Num } from "@/components/app/num";

type Tone = "default" | "signal" | "positive" | "negative";

const accent: Record<Tone, string> = {
  default: "before:bg-border-strong",
  signal: "before:bg-signal",
  positive: "before:bg-positive",
  negative: "before:bg-negative",
};

const valueTone: Record<Tone, string> = {
  default: "",
  signal: "text-signal",
  positive: "text-positive",
  negative: "text-negative",
};

/**
 * A figure with its label and a plain-language consequence. Deliberately has no
 * icon-in-a-circle: the tone is carried by a left rule and the value colour.
 */
export function StatTile({
  label,
  value,
  hint,
  tone = "default",
  href,
  className,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: Tone;
  href?: string;
  className?: string;
}) {
  const body = (
    <>
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <Num
        className={cn(
          "text-[22px] font-semibold leading-7 tracking-[-0.02em]",
          valueTone[tone]
        )}
      >
        {value}
      </Num>
      {hint ? (
        <span className="text-[11px] leading-4 text-muted-foreground">{hint}</span>
      ) : null}
    </>
  );

  const classes = cn(
    "relative flex min-w-0 flex-col gap-1 overflow-hidden rounded-lg border border-border bg-card py-3.5 pl-4 pr-4",
    "before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-['']",
    accent[tone],
    href && "transition-colors hover:border-border-strong hover:bg-surface-raised/40",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {body}
      </Link>
    );
  }

  return <div className={classes}>{body}</div>;
}
