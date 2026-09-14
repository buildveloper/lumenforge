import { cn } from "@/lib/utils";

/**
 * An empty state has to teach the space: what belongs here, why it matters, and
 * which action fills it. A label with no direction is an omission, not a state.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-lg border border-border bg-surface-sunken/40 px-6 py-10 text-center",
        className
      )}
    >
      {Icon ? <Icon className="mb-3 size-5 text-muted-foreground" /> : null}
      <p className="text-[14px] font-semibold tracking-[-0.01em]">{title}</p>
      <p className="mt-1 max-w-sm text-[13px] leading-5 text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}
