import * as React from "react";

import { cn } from "@/lib/utils";
import { fieldClass } from "./field-classes";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(fieldClass, "min-h-20 py-2 leading-5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Textarea };
