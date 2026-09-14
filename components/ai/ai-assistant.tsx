"use client";

import { useRef, useState } from "react";
import { ArrowUp, FileText, Lightbulb, ListChecks, Sparkles, Square } from "lucide-react";
import Markdown from "react-markdown";

import { CopyButton } from "@/components/app/copy-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAiStream, type AiTemplate } from "./use-ai-stream";

const TEMPLATES: {
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
    label: "Summarise progress",
    prompt: "Write a progress summary I can send to the client.",
    icon: Lightbulb,
  },
  {
    type: "tasks",
    label: "Suggest next tasks",
    prompt: "What should happen next on this project?",
    icon: ListChecks,
  },
  {
    type: "description",
    label: "Write the scope",
    prompt: "Write a clear scope description for this project.",
    icon: Sparkles,
  },
];

function Output({
  output,
  status,
  error,
  onStop,
}: {
  output: string;
  status: "idle" | "streaming" | "error";
  error: string | null;
  onStop: () => void;
}) {
  if (error) {
    return (
      <Card className="border-negative/40 bg-negative/5">
        <CardContent className="py-4">
          <p className="text-[13px] font-medium text-negative">{error}</p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Nothing was charged and nothing was saved. Adjust the request or try
            again.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!output && status === "streaming") {
    return (
      <Card>
        <CardContent className="flex items-center gap-2.5 py-4">
          <span className="flex gap-1" aria-hidden="true">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="size-1.5 animate-pulse rounded-full bg-signal"
                style={{ animationDelay: `${index * 160}ms` }}
              />
            ))}
          </span>
          <span className="text-[13px] text-muted-foreground">
            Reading your project and drafting…
          </span>
        </CardContent>
      </Card>
    );
  }

  if (!output) return null;

  return (
    <Card>
      <CardContent className="pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-[11px] font-medium text-muted-foreground">
            {status === "streaming" ? "Writing" : "Draft"}
          </span>
          <div className="flex items-center gap-1">
            {status === "streaming" ? (
              <Button variant="ghost" size="sm" className="gap-1.5" onClick={onStop}>
                <Square className="size-3" />
                Stop
              </Button>
            ) : null}
            <CopyButton value={output} label="Draft" />
          </div>
        </div>

        <div className="prose prose-sm max-w-none">
          <Markdown>{output}</Markdown>
          {status === "streaming" ? (
            <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-signal" />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function AIAssistant({ projectId }: { projectId: string }) {
  const { output, status, error, generate, stop } = useAiStream(projectId);
  const [prompt, setPrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const busy = status === "streaming";

  function submit() {
    const value = prompt.trim();
    if (!value || busy) return;
    setPrompt("");
    void generate({ type: "general", prompt: value });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {TEMPLATES.map((template) => (
          <button
            key={template.type}
            type="button"
            disabled={busy}
            onClick={() =>
              generate({ type: template.type, prompt: template.prompt })
            }
            className={cn(
              "flex items-start gap-3 rounded-lg border border-border bg-card p-3.5 text-left transition-colors",
              "hover:border-signal/40 hover:bg-surface-raised/40",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-md border border-border bg-surface-sunken text-signal">
              <template.icon className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-medium">
                {template.label}
              </span>
              <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                {template.prompt}
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          aria-label="Ask the assistant about this project"
          placeholder="Ask anything about this project. It reads the tasks, invoices, budget, and deadline."
          className="min-h-[52px] resize-none"
          maxLength={5000}
        />
        <Button
          onClick={submit}
          disabled={busy || prompt.trim().length === 0}
          size="icon"
          aria-label="Send"
          className="size-[52px] shrink-0"
        >
          <ArrowUp className="size-4" />
        </Button>
      </div>

      <Output output={output} status={status} error={error} onStop={stop} />
    </div>
  );
}
