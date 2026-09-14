import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FINAL_CTA } from "@/content/site";

import { Reveal } from "./reveal";
import { Section } from "./section-heading";

export function FinalCta() {
  return (
    <Section>
      <div className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[28rem]"
          style={{
            background:
              "radial-gradient(50% 60% at 50% 100%, var(--signal-subtle), transparent 70%)",
          }}
        />

        <div className="relative mx-auto flex max-w-[1120px] flex-col items-center px-4 py-24 text-center sm:px-6 sm:py-28 lg:py-32">
          <Reveal>
            <h2 className="display max-w-[18ch] text-[34px] leading-[1.06] sm:text-[44px]">
              {FINAL_CTA.title}
            </h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-[15px] leading-7 text-muted-foreground">
              {FINAL_CTA.body}
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href={FINAL_CTA.cta.href}>
                  {FINAL_CTA.cta.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link href={FINAL_CTA.secondary.href}>
                  {FINAL_CTA.secondary.label}
                </Link>
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
