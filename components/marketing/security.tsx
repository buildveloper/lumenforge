import { SECURITY } from "@/content/site";

import { Reveal } from "./reveal";
import { Section, SectionHeading } from "./section-heading";

export function Security() {
  return (
    <Section id="security">
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <SectionHeading
          eyebrow={SECURITY.eyebrow}
          title={SECURITY.title}
          body={SECURITY.body}
        />

        {/* A spec sheet rather than four icon cards: these are facts to check,
            not features to admire. */}
        <dl className="mt-14 flex flex-col">
          {SECURITY.items.map((item, index) => (
            <Reveal key={item.title}>
              <div className="grid gap-2 border-t border-border py-6 lg:grid-cols-[3rem_minmax(0,22ch)_minmax(0,1fr)] lg:items-baseline lg:gap-8">
                <span className="num text-[12px] text-border-strong">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <dt className="text-[15px] font-semibold tracking-[-0.01em]">
                  {item.title}
                </dt>
                <dd className="max-w-[58ch] text-[14px] leading-6 text-muted-foreground">
                  {item.body}
                </dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </Section>
  );
}
