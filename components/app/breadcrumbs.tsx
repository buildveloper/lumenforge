import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-[12px] text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight className="size-3 text-border-strong" aria-hidden="true" />
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn("truncate", isLast && "text-foreground")}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Derives crumbs from a pathname. Detail segments carry a supplied label. */
export function breadcrumbsForPath(
  pathname: string,
  labels: Record<string, string> = {}
): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  let href = "";

  for (const [index, segment] of segments.entries()) {
    href += `/${segment}`;
    const isLast = index === segments.length - 1;

    if (segment === "dashboard") {
      crumbs.push({ label: "Workspace", href: isLast ? undefined : "/dashboard" });
      continue;
    }

    const label =
      labels[segment] ??
      labels[href] ??
      segment.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

    crumbs.push({ label, href: isLast ? undefined : href });
  }

  return crumbs;
}
