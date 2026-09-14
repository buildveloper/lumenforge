"use client";

import { LazyMotion, MotionConfig, domAnimation, domMax } from "motion/react";

/**
 * `LazyMotion` keeps the animation feature set out of the main bundle path.
 * App routes need `domMax` for shared-layout transitions; the marketing surface
 * only needs `domAnimation`, which is far smaller and sits on the LCP route.
 */
export function MotionProvider({
  children,
  features = "app",
}: {
  children: React.ReactNode;
  features?: "app" | "marketing";
}) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={features === "app" ? domMax : domAnimation}>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
