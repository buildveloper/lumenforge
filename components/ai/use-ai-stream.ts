"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type AiTemplate = {
  type: "proposal" | "summary" | "tasks" | "description" | "general";
  prompt: string;
};

type Status = "idle" | "streaming" | "error";

/**
 * Consumes the token stream from /api/ai/stream. Kept as a hook so the full
 * assistant and the quick actions share one behaviour instead of two.
 */
export function useAiStream(projectId: string) {
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const router = useRouter();

  const stop = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setStatus("idle");
  }, []);

  const generate = useCallback(
    async ({ type, prompt }: AiTemplate) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      setOutput("");
      setError(null);
      setStatus("streaming");

      try {
        const response = await fetch("/api/ai/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, prompt, type }),
          signal: controller.signal,
        });

        if (!response.ok || !response.body) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error ?? "The AI request failed.");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          setOutput((previous) => previous + decoder.decode(value, { stream: true }));
        }

        setStatus("idle");
        router.refresh();
      } catch (caught) {
        if (caught instanceof Error && caught.name === "AbortError") return;
        setStatus("error");
        setError(caught instanceof Error ? caught.message : "The AI request failed.");
      }
    },
    [projectId, router]
  );

  return { output, status, error, generate, stop };
}
