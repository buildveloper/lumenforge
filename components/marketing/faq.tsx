import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ } from "@/content/site";

import { Section, SectionHeading } from "./section-heading";

export function Faq() {
  return (
    <Section>
      <div className="mx-auto max-w-[1120px] px-4 py-20 sm:px-6 sm:py-24 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:gap-16">
          <SectionHeading eyebrow={FAQ.eyebrow} title={FAQ.title} />

          <Accordion type="single" collapsible className="border-t border-border">
            {FAQ.items.map((item, index) => (
              <AccordionItem key={item.q} value={`item-${index}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </Section>
  );
}
