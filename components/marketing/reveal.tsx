import { cn } from "@/lib/utils";

/**
 * Scroll reveal without JavaScript.
 *
 * The animation lives in `globals.css` behind `@supports (animation-timeline:
 * view())`, so elements are visible by default and only animate where the
 * browser can drive them from scroll position. An earlier version used motion's
 * `whileInView`, which started every section at `opacity: 0` and left the page
 * blank anywhere JavaScript did not run.
 *
 * Staggering falls out of the scroll position for free: each element enters the
 * viewport at a slightly different moment.
 */
export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("reveal", className)}>{children}</div>;
}
