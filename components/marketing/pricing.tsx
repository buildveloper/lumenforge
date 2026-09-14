import Link from "next/link";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PRICING } from "@/content/site";

import { Reveal } from "./reveal";
import { Section, SectionHeading } from "./section-heading";

export function Pricing() {
  return (
    <Section id="pricing">
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow={PRICING.eyebrow}
          title={PRICING.title}
          body={PRICING.body}
          align="center"
        />

        <Reveal>
          <div className="mx-auto mt-12 max-w-lg overflow-hidden rounded-xl border border-border bg-card">
            <div className="border-b border-border px-6 py-6">
              <div className="flex items-baseline gap-2">
                <span className="num text-[40px] font-semibold leading-none tracking-[-0.03em]">
                  {PRICING.price}
                </span>
                <span className="text-[14px] text-muted-foreground">
                  {PRICING.period}
                </span>
              </div>

              <ul className="mt-6 flex flex-col gap-2.5">
                {PRICING.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-positive" />
                    <span className="text-[14px] leading-6">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button size="lg" className="mt-7 w-full" asChild>
                <Link href={PRICING.cta.href}>{PRICING.cta.label}</Link>
              </Button>
            </div>

            {/* Saying what is missing is worth more than an unqualified claim. */}
            <p className="bg-surface-sunken/50 px-6 py-4 text-[12px] leading-5 text-muted-foreground">
              {PRICING.caveat}
            </p>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
