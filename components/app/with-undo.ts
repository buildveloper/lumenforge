"use client";

import { toast } from "sonner";

/**
 * Undo beats confirm. Every delete in this product is a soft delete, so the
 * honest interaction is to do it immediately and offer the way back rather than
 * interrupting with a dialog that asks the user to be sure about something
 * they already decided.
 */
export async function withUndo({
  message,
  remove,
  undo,
  restoredMessage = "Restored",
}: {
  message: string;
  remove: () => Promise<unknown>;
  undo: () => Promise<unknown>;
  restoredMessage?: string;
}) {
  try {
    await remove();
  } catch {
    toast.error("That didn't work. Nothing was changed.");
    return false;
  }

  toast.success(message, {
    duration: 8000,
    action: {
      label: "Undo",
      onClick: () => {
        void (async () => {
          try {
            await undo();
            toast.success(restoredMessage);
          } catch {
            toast.error("Couldn't restore that. It's still in the activity log.");
          }
        })();
      },
    },
  });

  return true;
}
