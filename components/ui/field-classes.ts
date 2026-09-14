/**
 * Shared field chrome so inputs, textareas, and selects stay identical.
 * The `pointer: coarse` rule gives touch users a 44px target without
 * inflating the visual size on desktop.
 */
export const fieldClass = [
  "flex w-full rounded-md border border-input bg-background px-3 text-[13px] text-foreground",
  "transition-colors placeholder:text-muted-foreground",
  "hover:border-border-strong",
  "disabled:cursor-not-allowed disabled:opacity-45",
  "[@media(pointer:coarse)]:min-h-11",
].join(" ");
