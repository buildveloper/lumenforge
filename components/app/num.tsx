import { cn } from "@/lib/utils";

/**
 * Figures and identifiers render in mono with tabular figures so columns of
 * numbers line up and can be compared by scanning rather than by reading.
 */
export function Num({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("num", className)}>{children}</span>;
}
