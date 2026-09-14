import type { Metadata } from "next";

import { Differentiators } from "@/components/marketing/differentiators";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { Portal } from "@/components/marketing/portal";
import { Pricing } from "@/components/marketing/pricing";
import { Proof } from "@/components/marketing/proof";
import { Security } from "@/components/marketing/security";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { Workflow } from "@/components/marketing/workflow";

// No `title` here on purpose: the root layout's default already names the
// product, and setting one adds the "%s · LumenForge" template on top of it,
// producing "LumenForge — … · LumenForge".
export const metadata: Metadata = {
  description:
    "Projects, tasks, and invoices in one place, plus a client portal they can log into. Free, with every feature included.",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Workflow />
        <Differentiators />
        <Portal />
        <Security />
        <Pricing />
        <Faq />
        <Proof />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
