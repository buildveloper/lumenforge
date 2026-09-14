import { cn } from "@/lib/utils";

/**
 * The Aperture mark — a frame with light gathering in one corner.
 * Lumen (light) + Forge (heat) in one geometric glyph. Drawn on a 24px grid at
 * a 4px radius so it echoes the product's own geometry, and it survives 16px.
 */
export function LogoMark({
  className,
  ...props
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn("size-5", className)}
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="4"
        stroke="currentColor"
        strokeWidth="2.4"
      />
      <path
        d="M12.8 19.8H17a2.8 2.8 0 0 0 2.8-2.8v-4.2L12.8 19.8Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={cn("text-signal", markClassName)} />
      <span
        className={cn(
          "text-[15px] font-semibold tracking-[-0.02em] text-foreground",
          wordmarkClassName
        )}
      >
        LumenForge
      </span>
    </span>
  );
}
