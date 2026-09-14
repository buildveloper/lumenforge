"use client";

import { m } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Content settles in on navigation instead of snapping. Enter-only on purpose:
 * holding the previous page mounted for an exit would delay the new route and
 * keep stale DOM on screen, which is worse than an instant swap.
 */
export function RouteSettle({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <m.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </m.div>
  );
}
