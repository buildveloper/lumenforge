import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const POINTS = [
  {
    title: "One workspace per engagement",
    body: "Client, project, tasks, and invoices in the same place instead of four tabs.",
  },
  {
    title: "Your clients get a portal",
    body: "They see progress and invoices without you writing a status email.",
  },
  {
    title: "AI that has read the project",
    body: "Proposals and updates drafted from the actual tasks and budget, not thin air.",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,1fr)]">
      <div className="flex flex-col">
        <header className="flex h-14 shrink-0 items-center px-4 sm:px-6">
          <Link href="/" className="rounded-sm">
            <Logo />
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-4 py-10">
          {children}
        </main>
      </div>

      {/* Brand panel. Real claims only, no borrowed logos or invented numbers. */}
      <aside className="relative hidden flex-col justify-center gap-8 overflow-hidden border-l border-border bg-card p-12 lg:flex">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-1/4 -top-1/4 size-[36rem] rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, var(--signal-subtle), transparent 70%)",
          }}
        />

        <p className="relative text-[28px] font-semibold leading-tight tracking-[-0.03em]">
          Run the engagement.
          <br />
          Show the client.
          <br />
          Track the money.
        </p>

        <ul className="relative flex flex-col gap-5">
          {POINTS.map((point) => (
            <li key={point.title} className="flex flex-col gap-1">
              <span className="flex items-center gap-2 text-[13px] font-medium">
                <span className="size-1.5 rounded-full bg-signal" />
                {point.title}
              </span>
              <span className="pl-3.5 text-[13px] leading-5 text-muted-foreground">
                {point.body}
              </span>
            </li>
          ))}
        </ul>

        <Button variant="ghost" size="sm" className="relative w-fit gap-2" asChild>
          <Link href="/">
            <ArrowLeft className="size-3.5" />
            Back to the site
          </Link>
        </Button>
      </aside>
    </div>
  );
}
