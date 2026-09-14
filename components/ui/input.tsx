import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldClass } from "./field-classes";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        fieldClass,
        "h-9 py-2",
        "file:border-0 file:bg-transparent file:text-[13px] file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
