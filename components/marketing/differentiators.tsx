import { Num } from "@/components/app/num";
import { StatusChip } from "@/components/app/status-chip";
import { DIFFERENTIATORS } from "@/content/site";

import { Reveal } from "./reveal";
import { Section, SectionHeading } from "./section-heading";

function OneWorkspace() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3.5 py-3">
        <Num className="text-[12px] font-medium">INV-2026-004</Num>
        <StatusChip status="sent" />
        <Num className="text-[12px] text-muted-foreground">$4,800.00</Num>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3.5 py-3">
        <span className="text-[12px]">Rebuild the pricing page</span>
        <StatusChip status="in_progress" />
        <Num className="text-[12px] text-muted-foreground">15 Sep</Num>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-card px-3.5 py-3">
        <span className="text-[12px]">Northwind Studio</span>
        <span className="text-[11px] text-positive">Portal linked</span>
        <Num className="text-[12px] text-muted-foreground">2 projects</Num>
      </div>
    </div>
  );
}

function GroundedAi() {
  return (
    <div className="rounded-md border border-border bg-card p-3.5">
      <p className="text-[11px] text-muted-foreground">
        Read before writing
      </p>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        {["14 tasks", "3 invoices", "$12,400 budget", "12-day deadline"].map(
          (item) => (
            <li
              key={item}
              className="flex items-center gap-2 text-[12px] text-muted-foreground"
            >
              <span className="size-1 rounded-full bg-signal" />
              {item}
            </li>
          )
        )}
      </ul>
    </div>
  );
}

function AuditTrail() {
  const rows = [
    { action: "Invoice sent", time: "09:14" },
    { action: "Task moved to Review", time: "08:52" },
    { action: "Client approved the hero", time: "Yesterday" },
  ];

  return (
    <div className="rounded-md border border-border bg-card p-1.5">
      {rows.map((row) => (
        <div
          key={row.action}
          className="flex items-center justify-between gap-3 px-2 py-2"
        >
          <span className="flex items-center gap-2 text-[12px]">
            <span className="size-1.5 rounded-full bg-border-strong" />
            {row.action}
          </span>
          <Num className="text-[11px] text-muted-foreground">{row.time}</Num>
        </div>
      ))}
    </div>
  );
}

const FRAGMENTS = [OneWorkspace, GroundedAi, AuditTrail];

export function Differentiators() {
  return (
    <Section>
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow={DIFFERENTIATORS.eyebrow}
          title={DIFFERENTIATORS.title}
        />

        {/* Asymmetric on purpose: one lead claim at full width, two supporting it.
            A uniform grid of three would read as filler. */}
        <div className="mt-14 flex flex-col gap-12">
          {DIFFERENTIATORS.items.map((item, index) => {
            const Fragment = FRAGMENTS[index];
            const lead = index === 0;

            return (
              <Reveal key={item.title}>
                <article
                  className={
                    lead
                      ? "grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16"
                      : "grid gap-6 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-center lg:gap-16"
                  }
                >
                  <div className={lead ? "" : "lg:order-2"}>
                    <h3
                      className={
                        lead
                          ? "display max-w-[22ch] text-[26px] leading-[1.15] sm:text-[32px]"
                          : "text-[17px] font-semibold tracking-[-0.01em]"
                      }
                    >
                      {item.title}
                    </h3>
                    <p
                      className={
                        lead
                          ? "mt-4 max-w-[52ch] text-[15px] leading-7 text-muted-foreground"
                          : "mt-3 max-w-[52ch] text-[14px] leading-6 text-muted-foreground"
                      }
                    >
                      {item.body}
                    </p>
                    {lead ? (
                      <p className="mt-4 text-[13px] text-muted-foreground">
                        {item.detail}
                      </p>
                    ) : null}
                  </div>

                  <div className={lead ? "" : "lg:order-1"}>
                    <Fragment />
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
