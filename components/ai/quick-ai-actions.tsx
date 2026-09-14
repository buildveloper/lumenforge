"use client";

import { FileText, Lightbulb, ListChecks, Square, Sparkles } from "lucide-react";
import Markdown from "react-markdown";

import { CopyButton } from "@/components/app/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useAiStream, type AiTemplate } from "./use-ai-stream";

const ACTIONS: {
  type: AiTemplate["type"];
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    type: "proposal",
    label: "Draft a proposal",
    prompt: "Write a client-ready proposal for this project.",
    icon: FileText,
  },
  {
    type: "summary",
    label: "Summarise status",
    prompt: "Write a short status update for the client.",
    icon: Lightbulb,
  },
  {
    type: "tasks",
    label: "Suggest next steps",
    prompt: "What are the next three things to do?",
    icon: ListChecks,
  },
];

export function QuickAIActions({ projectId }: { projectId: string }) {
  const { output, status, error, generate, stop } = useAiStream(projectId);
  const busy = status === "streaming";

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Sparkles className="size-3.5 text-signal" />
        <h2 className="text-[11px] font-medium text-muted-foreground">
          Draft with AI
        </h2>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {ACTIONS.map((action) => (
          <button
            key={action.type}
            type="button"
            disabled={busy}
            onClick={() => generate({ type: action.type, prompt: action.prompt })}
            className={cn(
              "flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-3 text-left transition-colors",
              "hover:border-signal/40 hover:bg-surface-raised/40",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <action.icon className="size-3.5 shrink-0 text-signal" />
            <span className="truncate text-[13px] font-medium">{action.label}</span>
          </button>
        ))}
      </div>

      {error ? (
        <p className="rounded-lg border border-negative/40 bg-negative/5 px-3.5 py-2.5 text-[12px] text-negative">
          {error}
        </p>
      ) : null}

      {output ? (
        <Card>
          <CardContent className="pt-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-[11px] font-medium text-muted-foreground">
                {busy ? "Writing" : "Draft"}
              </span>
              <div className="flex items-center gap-1">
                {busy ? (
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={stop}>
                    <Square className="size-3" />
                    Stop
                  </Button>
                ) : null}
                <CopyButton value={output} label="Draft" />
              </div>
            </div>
            <div className="prose prose-sm max-w-none">
              <Markdown>{output}</Markdown>
              {busy ? (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-signal" />
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
