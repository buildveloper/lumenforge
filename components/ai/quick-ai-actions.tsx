"use client";

import { useState } from "react";
import { Sparkles, FileText, Lightbulb, ListChecks } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { generateAIResponse } from "@/server/actions/ai";
import { toast } from "sonner";

type QuickAIActionsProps = {
  projectId: string;
};

const ACTIONS = [
  {
    label: "Generate Proposal",
    icon: FileText,
    type: "proposal",
    prompt: "Write a professional project proposal for this project.",
  },
  {
    label: "Summarize Status",
    icon: Lightbulb,
    type: "summary",
    prompt: "Summarize the current project status in 2-3 sentences.",
  },
  {
    label: "Suggest Timeline",
    icon: ListChecks,
    type: "tasks",
    prompt: "Suggest a realistic timeline with milestones based on the project.",
  },
];

export function QuickAIActions({ projectId }: QuickAIActionsProps) {
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);

  async function handleAction(action: (typeof ACTIONS)[number]) {
    setLoading(action.type);
    setResult(null);

    try {
      const res = await generateAIResponse(
        projectId,
        action.prompt,
        action.type
      );
      if (res.success && res.response) {
        setResult(res.response);
      } else {
        toast.error("Generation failed");
      }
    } catch {
      toast.error("AI generation failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          AI Quick Actions
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {ACTIONS.map((action) => (
          <Card
            key={action.type}
            className="border-border/40 bg-card/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
            onClick={() => handleAction(action)}
          >
            <CardContent className="flex flex-col items-center text-center py-5">
              <action.icon className="h-5 w-5 text-primary mb-2" />
              <span className="text-sm font-medium">
                {loading === action.type ? "Generating..." : action.label}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {result && (
        <Card className="border-primary/20 bg-card/50">
          <CardContent className="py-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {result}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
