import { TESTIMONIALS } from "@/content/site";

import { Section, SectionHeading } from "./section-heading";

export function Proof() {
  return (
    <Section>
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={TESTIMONIALS.eyebrow}
            title={TESTIMONIALS.title}
            body={TESTIMONIALS.body}
          />

          {TESTIMONIALS.sample ? (
            <p className="shrink-0 rounded-sm border border-signal/40 bg-signal-subtle px-2 py-1 text-[11px] font-medium text-signal">
              Sample content — not real customers
            </p>
          ) : null}
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.items.map((item) => (
            <figure key={item.quote} className="flex flex-col gap-4 bg-card p-6">
              <blockquote className="text-[14px] leading-6 text-muted-foreground">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-2.5">
                <span className="grid size-6 place-items-center rounded-sm border border-dashed border-border-strong text-[10px] text-muted-foreground">
                  ?
                </span>
                <span>
                  <span className="block text-[12px] font-medium">
                    {item.name}
                  </span>
                  <span className="block text-[11px] text-muted-foreground">
                    {item.role}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </Section>
  );
}
