import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

/**
 * Privacy and terms previously duplicated their entire header markup. One
 * layout, one place to change.
 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[760px] items-center justify-between px-4 sm:px-6">
          <Link href="/" className="rounded-sm">
            <Logo />
          </Link>
          <Button variant="ghost" size="sm" className="gap-2" asChild>
            <Link href="/">
              <ArrowLeft className="size-3.5" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-muted-foreground">
          Last updated {updated}
        </p>

        <div className="prose prose-sm mt-10 max-w-none">{children}</div>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[760px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-[13px] text-muted-foreground sm:px-6">
          <Link href="/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <span className="ml-auto">
            &copy; {new Date().getFullYear()} LumenForge
          </span>
        </div>
      </footer>
    </div>
  );
}
