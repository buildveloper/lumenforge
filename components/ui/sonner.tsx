"use client";

import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { Toaster as Sonner } from "sonner";

/**
 * Sonner ships its own palette, which fights ours. `unstyled` hands every slot
 * to the design system so toasts match the product instead of approximating it.
 */
const Toaster = (props: React.ComponentProps<typeof Sonner>) => (
  <Sonner
    className="toaster group"
    position="bottom-right"
    offset={16}
    gap={8}
    icons={{
      success: <CircleCheck className="size-4 text-positive" />,
      error: <OctagonX className="size-4 text-negative" />,
      warning: <TriangleAlert className="size-4 text-negative" />,
      info: <Info className="size-4 text-signal" />,
      loading: <LoaderCircle className="size-4 animate-spin text-signal" />,
    }}
    toastOptions={{
      unstyled: true,
      classNames: {
        toast:
          "group/toast flex w-full items-start gap-3 rounded-lg border border-border bg-popover p-3.5 text-popover-foreground shadow-popover",
        title: "text-[13px] font-medium",
        description: "mt-0.5 text-[12px] leading-5 text-muted-foreground",
        icon: "mt-px shrink-0",
        content: "flex min-w-0 flex-1 flex-col",
        actionButton:
          "ml-auto shrink-0 rounded-md bg-primary px-2.5 py-1 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-88 [@media(pointer:coarse)]:min-h-9",
        cancelButton:
          "ml-auto shrink-0 rounded-md px-2.5 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground [@media(pointer:coarse)]:min-h-9",
      },
    }}
    {...props}
  />
);

export { Toaster };
