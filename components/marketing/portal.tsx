import { Check } from "lucide-react";

import { Num } from "@/components/app/num";
import { StatusChip } from "@/components/app/status-chip";
import { PORTAL } from "@/content/site";

import { Reveal } from "./reveal";
import { Section, SectionHeading } from "./section-heading";

/** What the client sees. Same tokens, different permissions. */
function PortalPreview() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <span className="text-[13px] font-medium">Your projects</span>
        <span className="text-[12px] text-muted-foreground">Northwind Studio</span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-lg border border-border bg-surface-sunken/40 p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium">Website redesign</p>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Due in 12 days
              </p>
            </div>
            <StatusChip status="active" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-raised">
              <span className="block h-full w-[43%] rounded-full bg-signal" />
            </span>
            <Num className="text-[11px] text-muted-foreground">6/14</Num>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex h-7 items-center gap-1.5 rounded-md bg-primary px-2.5 text-[12px] font-medium text-primary-foreground">
              <Check className="size-3" />
              Approve
            </span>
            <span className="inline-flex h-7 items-center rounded-md border border-border-strong px-2.5 text-[12px] text-muted-foreground">
              Request changes
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg border border-border px-3.5 py-3">
          <div className="flex items-center gap-3">
            <Num className="text-[12px] font-medium">INV-2026-004</Num>
            <StatusChip status="sent" />
          </div>
          <Num className="text-[12px] text-muted-foreground">$4,800.00</Num>
        </div>
      </div>
    </div>
  );
}

export function Portal() {
  return (
    <Section id="portal">
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16">
          <div>
            <SectionHeading
              eyebrow={PORTAL.eyebrow}
              title={PORTAL.title}
              body={PORTAL.body}
            />

            <ul className="mt-8 flex flex-col gap-3">
              {PORTAL.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-signal" />
                  <span className="text-[14px] leading-6 text-muted-foreground">
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <PortalPreview />
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
