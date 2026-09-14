import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Page not found" };

const SUGGESTIONS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/projects", label: "Projects" },
  { href: "/dashboard/invoices", label: "Invoices" },
  { href: "/", label: "Home" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Logo />

      <div className="mt-10 flex max-w-md flex-col items-center text-center">
        <p className="num text-[12px] text-muted-foreground">404</p>
        <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em]">
          There is nothing at this address
        </h1>
        <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
          The page may have been renamed, or the link that brought you here may
          be out of date. Nothing was deleted.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {SUGGESTIONS.map((item, index) => (
            <Button
              key={item.href}
              variant={index === 0 ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
