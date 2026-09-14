import { Num } from "@/components/app/num";
import { StatusChip } from "@/components/app/status-chip";
import { WORKFLOW } from "@/content/site";

import { Reveal } from "./reveal";
import { Section, SectionHeading } from "./section-heading";

/** A tiny real fragment of the interface each step produces. */
function Fragment({ step }: { step: string }) {
  if (step === "client") {
    return (
      <span className="flex items-center gap-2 text-[12px] text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-sm border border-border bg-surface-sunken text-[10px]">
          N
        </span>
        Northwind Studio
        <span className="text-positive">linked</span>
      </span>
    );
  }

  if (step === "project") {
    return (
      <span className="flex items-center gap-3">
        <StatusChip status="active" />
        <Num className="text-[12px] text-muted-foreground">$12,400 · 12 days</Num>
      </span>
    );
  }

  if (step === "board") {
    return (
      <span className="flex items-center gap-2">
        <span className="h-1 w-24 overflow-hidden rounded-full bg-surface-raised">
          <span className="block h-full w-[43%] rounded-full bg-signal" />
        </span>
        <Num className="text-[12px] text-muted-foreground">6/14</Num>
      </span>
    );
  }

  if (step === "ai") {
    return (
      <span className="rounded-md border border-border bg-surface-sunken px-2 py-1 text-[11px] text-muted-foreground">
        Draft ready · read 14 tasks
      </span>
    );
  }

  return (
    <span className="flex items-center gap-3">
      <Num className="text-[12px] font-medium">INV-2026-004</Num>
      <StatusChip status="paid" />
    </span>
  );
}

export function Workflow() {
  return (
    <Section id="workflow">
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow={WORKFLOW.eyebrow}
          title={WORKFLOW.title}
          body={WORKFLOW.body}
        />

        <ol className="mt-14 flex flex-col">
          {WORKFLOW.steps.map((step, index) => (
            <Reveal key={step.key}>
              <li className="grid gap-3 border-t border-border py-6 lg:grid-cols-[3rem_minmax(0,20ch)_minmax(0,1fr)_minmax(0,18rem)] lg:items-baseline lg:gap-8">
                <Num className="text-[12px] text-border-strong">
                  {String(index + 1).padStart(2, "0")}
                </Num>

                <h3 className="text-[15px] font-semibold tracking-[-0.01em]">
                  {step.label}
                </h3>

                <p className="max-w-[46ch] text-[14px] leading-6 text-muted-foreground">
                  {step.body}
                </p>

                <div className="lg:justify-self-end">
                  <Fragment step={step.key} />
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </Section>
  );
}
