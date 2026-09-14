import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HERO, POSITIONING } from "@/content/site";
import { ProductArtifact } from "./product-artifact";
import { Reveal } from "./reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-[1120px] px-4 pb-16 pt-14 sm:px-6 sm:pt-20 lg:pb-24 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div className="flex flex-col items-start">
            <p className="text-[12px] font-medium text-signal">{HERO.eyebrow}</p>

            <h1 className="display mt-5 text-[40px] leading-[1.04] sm:text-[52px] lg:text-[58px]">
              {HERO.headline}
            </h1>

            <p className="mt-5 max-w-[36rem] text-[16px] leading-7 text-muted-foreground">
              {HERO.subhead}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="gap-2" asChild>
                <Link href={HERO.primaryCta.href}>
                  {HERO.primaryCta.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href={HERO.secondaryCta.href}>{HERO.secondaryCta.label}</a>
              </Button>
            </div>

            <p className="mt-5 text-[12px] text-muted-foreground">
              {HERO.footnote}
            </p>
          </div>

          <Reveal className="lg:-mr-6 xl:-mr-16">
            <ProductArtifact />
          </Reveal>
        </div>

        {/* Positioning, not fake proof: what this replaces. */}
        <Reveal>
          <div className="mt-16 flex flex-col gap-4 border-t border-border pt-8 sm:mt-20 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="text-[13px] font-medium">{POSITIONING.lead}</p>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {POSITIONING.items.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[13px] text-muted-foreground"
                >
                  <span className="size-1 rounded-full bg-border-strong" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 max-w-xl text-[12px] leading-5 text-muted-foreground">
            {POSITIONING.note}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
