import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  className,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  body?: string;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      <p className="text-[12px] font-medium text-signal">{eyebrow}</p>
      <h2 className="display mt-4 max-w-[20ch] text-[30px] leading-[1.08] sm:text-[38px]">
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "mt-4 text-[15px] leading-7 text-muted-foreground",
            align === "center" ? "max-w-[52ch]" : "max-w-[58ch]"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

export function Section({
  id,
  children,
  className,
  bordered = true,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  bordered?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-16",
        bordered && "border-t border-border",
        className
      )}
    >
      {children}
    </section>
  );
}
