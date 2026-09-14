"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Users } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/logo";
import { updateUserRole } from "@/server/actions/user";
import { cn } from "@/lib/utils";

type Option = {
  role: "freelancer" | "client";
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  gains: string[];
};

const OPTIONS: Option[] = [
  {
    role: "freelancer",
    icon: Briefcase,
    title: "I sell the work",
    body: "You run the engagements and get paid for them.",
    gains: [
      "Clients, projects, and a Kanban board",
      "Invoices with your own numbering",
      "AI drafts proposals and updates from real project data",
    ],
  },
  {
    role: "client",
    icon: Users,
    title: "I'm the client",
    body: "You're here to see progress and invoices for work you commissioned.",
    gains: [
      "Progress on every project shared with your email",
      "Invoices addressed to you",
      "Approve deliverables or ask for changes",
    ],
  },
];

/**
 * Shown once, when the account has no role yet. These are real buttons rather
 * than clickable divs, so it is reachable by keyboard, and Escape is allowed to
 * dismiss the dialog chrome without blocking the choice.
 */
export function RoleSelector() {
  const [pending, setPending] = useState<Option["role"] | null>(null);
  const router = useRouter();

  async function choose(role: Option["role"]) {
    setPending(role);
    try {
      const result = await updateUserRole({ role });
      if (role === "client" && result.claimed > 0) {
        toast.success(
          `Found ${result.claimed} ${result.claimed === 1 ? "record" : "records"} linked to your email`
        );
      } else if (role === "client") {
        toast.success("You're set up as a client");
      } else {
        toast.success("You're set up as a freelancer");
      }
      router.refresh();
    } catch {
      setPending(null);
      toast.error("Couldn't save that. Try again.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-background p-4 scroll-thin">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo />
          <h1 className="mt-6 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            How will you use LumenForge?
          </h1>
          <p className="mt-2 max-w-md text-[13px] leading-5 text-muted-foreground">
            This decides what you see first. You can switch it later in settings,
            and nothing is deleted if you do.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((option) => {
            const busy = pending === option.role;
            return (
              <button
                key={option.role}
                type="button"
                onClick={() => choose(option.role)}
                disabled={pending !== null}
                aria-busy={busy}
                className={cn(
                  "group flex flex-col rounded-xl border border-border bg-card p-5 text-left transition-colors",
                  "hover:border-signal/40 hover:bg-surface-raised/40",
                  "disabled:cursor-not-allowed disabled:opacity-60",
                  busy && "border-signal/40"
                )}
              >
                <span className="mb-4 grid size-9 place-items-center rounded-md border border-border bg-surface-sunken text-signal">
                  <option.icon className="size-4" />
                </span>

                <span className="text-[15px] font-semibold tracking-[-0.01em]">
                  {option.title}
                </span>
                <span className="mt-1 text-[13px] leading-5 text-muted-foreground">
                  {option.body}
                </span>

                <ul className="mt-4 flex flex-col gap-1.5">
                  {option.gains.map((gain) => (
                    <li
                      key={gain}
                      className="flex items-start gap-2 text-[12px] leading-5 text-muted-foreground"
                    >
                      <span className="mt-2 size-1 shrink-0 rounded-full bg-border-strong" />
                      {gain}
                    </li>
                  ))}
                </ul>

                <span className="mt-5 text-[12px] font-medium text-signal">
                  {busy ? "Setting up…" : "Choose this"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
