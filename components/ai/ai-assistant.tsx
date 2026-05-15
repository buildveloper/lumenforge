"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Copy,
  Check,
  FileText,
  ListChecks,
  Lightbulb,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { generateAIResponse } from "@/server/actions/ai";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

const TEMPLATES = [
  {
    label: "Generate Proposal",
    icon: FileText,
    type: "proposal",
    prompt: "Write a professional project proposal for this project.",
  },
  {
    label: "Summarize Progress",
    icon: Lightbulb,
    type: "summary",
    prompt: "Summarize the current progress and status of this project.",
  },
  {
    label: "Suggest Next Tasks",
    icon: ListChecks,
    type: "tasks",
    prompt: "Based on the current project state, suggest the next 5-10 tasks with priorities.",
  },
  {
    label: "Write Description",
    icon: MessageSquare,
    type: "description",
    prompt: "Write a professional, detailed description for this project or its next invoice.",
  },
];

type AIAssistantProps = {
  projectId: string;
};

export function AIAssistant({ projectId }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  // Typing animation
  useEffect(() => {
    if (!response) {
      setDisplayText("");
      return;
    }

    let i = 0;
    const speed = 10;
    const interval = setInterval(() => {
      i++;
      setDisplayText(response.slice(0, i));
      if (i >= response.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [response]);

  async function handleGenerate(
    type: string,
    templatePrompt?: string
  ) {
    const finalPrompt = prompt.trim() || templatePrompt || "";
    if (!finalPrompt) return;

    setLoading(true);
    setResponse("");
    setDisplayText("");

    try {
      const result = await generateAIResponse(projectId, finalPrompt, type);
      if (result.success && result.response) {
        setResponse(result.response);
      } else {
        toast.error(result.error ?? "Generation failed");
      }
    } catch {
      toast.error("AI generation failed. Check your Groq API key.");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(response);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Templates */}
      <div className="grid gap-3 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <Card
            key={t.type}
            className="border-border/40 bg-card/50 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-primary/30"
            onClick={() => {
              setPrompt(t.prompt);
              handleGenerate(t.type, t.prompt);
            }}
          >
            <CardContent className="flex items-center gap-4 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                <t.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-medium text-sm">{t.label}</h4>
                <p className="text-xs text-muted-foreground">
                  Click to generate
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom prompt */}
      <div className="flex gap-3">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Or type a custom prompt... (e.g. 'Write a weekly status update for my client')"
          rows={2}
          className="min-h-[60px] resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleGenerate("general");
            }
          }}
        />
        <Button
          size="icon"
          className="h-[60px] w-[60px] shrink-0"
          onClick={() => handleGenerate("general")}
          disabled={loading || !prompt.trim()}
        >
          {loading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Response */}
      {loading && !displayText && (
        <Card className="border-border/40 bg-card/50">
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
              <span className="text-sm">Generating AI response...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {displayText && (
        <Card className="border-border/40 bg-card/50 relative">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Response
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={copyToClipboard}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            <div
              ref={responseRef}
              className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-code:text-primary prose-pre:bg-muted prose-pre:border prose-pre:border-border/40"
            >
              <ReactMarkdown>{displayText}</ReactMarkdown>
            </div>

            {loading && (
              <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-0.5 align-middle" />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
