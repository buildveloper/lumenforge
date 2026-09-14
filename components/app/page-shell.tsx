import { cn } from "@/lib/utils";

const WIDTH = {
  wide: "max-w-[1440px]",
  default: "max-w-[1120px]",
  narrow: "max-w-[760px]",
} as const;

export function PageShell({
  children,
  width = "default",
  className,
}: {
  children: React.ReactNode;
  width?: keyof typeof WIDTH;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        WIDTH[width],
        className
      )}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow}
        <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-1 text-[13px] leading-5 text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

/** A titled region inside a page. Optional action sits on the header row. */
export function Section({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {title || action ? (
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <h2 className="text-[13px] font-semibold tracking-[-0.01em]">{title}</h2>
          ) : null}
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
