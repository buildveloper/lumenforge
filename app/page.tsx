import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Users,
  Briefcase,
  Receipt,
  Sparkles,
  BarChart3,
  Shield,
  Check,
} from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: Briefcase,
    title: "Projects & Tasks",
    description:
      "Track every project from kickoff to delivery. Break work into tasks with priorities, due dates, and real-time status updates.",
  },
  {
    icon: Users,
    title: "Client Portal",
    description:
      "Give clients a professional portal to view project progress, approve deliverables, and access invoices — all in one place.",
  },
  {
    icon: Receipt,
    title: "Invoicing & Payments",
    description:
      "Create polished invoices in seconds. Track sent, paid, and overdue payments with an at-a-glance revenue dashboard.",
  },
  {
    icon: Sparkles,
    title: "AI Assistant",
    description:
      "Generate proposals, summarize project updates, and get smart suggestions powered by AI. Spend less time writing and more time creating.",
  },
  {
    icon: BarChart3,
    title: "Activity & Reports",
    description:
      "Monitor everything with a real-time activity feed and detailed reports. Know exactly what's happening across your business.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Enterprise-grade security with encrypted connections, rate limiting, role-based access, and input validation on every request.",
  },
];

const testimonials = [
  {
    name: "Sarah Chen",
    role: "UX Designer & Consultant",
    quote:
      "LumenForge replaced three tools I was juggling. Now clients see project progress, approve work, and pay invoices — all from one portal. It's saved me hours every week.",
  },
  {
    name: "Marcus Rivera",
    role: "Full-Stack Developer",
    quote:
      "The dashboard gives me everything at a glance — active projects, outstanding invoices, and tasks due this week. Finally stopped living in spreadsheets.",
  },
  {
    name: "Emily Park",
    role: "Brand Strategist",
    quote:
      "My clients love how professional everything feels. The portal, the invoices, the project updates — LumenForge makes my solo operation feel like a premium agency.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* -- Nav ---------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <Briefcase className="h-5 w-5 text-primary" />
              <span className="text-lg font-semibold tracking-tight">
                LumenForge
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Testimonials
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* -- Hero ------------------------------------------------- */}
        <section className="relative overflow-hidden">
          {/* Background blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary via-accent to-transparent opacity-15 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-[60%] -z-10 transform-gpu overflow-hidden blur-3xl"
          >
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary via-accent to-transparent opacity-10 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
          </div>

          <div className="mx-auto max-w-6xl px-4 pt-28 pb-20 sm:px-6 sm:pt-36 sm:pb-28 lg:pt-44 lg:pb-36">
            <div className="flex flex-col items-center text-center">
              <Badge
                variant="secondary"
                className="mb-8 px-4 py-1.5 text-sm font-medium"
              >
                Built for professional freelancers
              </Badge>

              <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl lg:leading-[1.1]">
                Run your freelance business in{" "}
                <span className="text-primary">one place</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
                Project management, client portal, invoicing, and AI assistance
                — all in a beautiful, secure workspace built for independent
                professionals.
              </p>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Button
                  size="lg"
                  className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/25"
                  asChild
                >
                  <Link href="/sign-up">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  asChild
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>

              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required · Free to start
              </p>
            </div>
          </div>
        </section>

        {/* -- Logo bar ---------------------------------------------- */}
        <section className="border-y border-border/40 bg-muted/10">
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
            <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
              Everything you need in one platform
            </p>
            <div className="flex items-center justify-center gap-8 sm:gap-12">
              {[
                { icon: Briefcase, label: "Projects" },
                { icon: Users, label: "Clients" },
                { icon: Receipt, label: "Invoices" },
                { icon: Sparkles, label: "AI" },
                { icon: Shield, label: "Security" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex flex-col items-center gap-1.5"
                >
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* -- Features ---------------------------------------------- */}
        <section id="features" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-32">
            <div className="mb-16 text-center">
              <Badge variant="secondary" className="mb-4">
                Features
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to run your business
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                From client onboarding to getting paid — LumenForge handles the
                operations so you can focus on the work that matters.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="group border-border/40 bg-card/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20"
                >
                  <CardHeader>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mb-4 group-hover:bg-primary/15 transition-colors">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* -- Pricing placeholder ----------------------------------- */}
        <section
          id="pricing"
          className="border-t border-border/40 bg-muted/20 scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-32 text-center">
            <Badge variant="secondary" className="mb-4">
              Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Start with a generous free tier. Upgrade when your business grows.
              Full pricing details coming soon.
            </p>
            <div className="mt-12 max-w-sm mx-auto">
              <Card className="border-primary/20 bg-card/50 ring-1 ring-primary/10">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl">Free</CardTitle>
                  <CardDescription>For independent freelancers</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-6">
                  <div className="mb-6">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-muted-foreground mb-8">
                    {[
                      "Unlimited clients & projects",
                      "Professional invoicing",
                      "AI-powered assistance",
                      "Client portal access",
                      "Activity tracking & reports",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full" asChild>
                    <Link href="/sign-up">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* -- Testimonials ------------------------------------------ */}
        <section
          id="testimonials"
          className="border-t border-border/40 scroll-mt-20"
        >
          <div className="mx-auto max-w-6xl px-4 py-28 sm:px-6 sm:py-32">
            <div className="mb-16 text-center">
              <Badge variant="secondary" className="mb-4">
                Testimonials
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                What our users say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Join freelancers who&apos;ve streamlined their operations with
                LumenForge.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((t) => (
                <Card
                  key={t.name}
                  className="border-border/40 bg-card/50 hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="h-4 w-4 text-primary"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <blockquote className="text-sm text-muted-foreground leading-relaxed mb-6">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {t.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* -- Final CTA --------------------------------------------- */}
        <section className="border-t border-border/40 bg-muted/20">
          <div className="mx-auto max-w-3xl px-4 py-28 sm:px-6 sm:py-32 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to simplify your freelance workflow?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
              Join freelancers who manage their entire business with LumenForge.
              Free to start, no credit card required.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4">
              <Button
                size="lg"
                className="gap-2 h-12 px-8 text-base shadow-lg shadow-primary/25"
                asChild
              >
                <Link href="/sign-up">
                  Create Free Account
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* -- Footer ------------------------------------------------- */}
      <footer className="border-t border-border/40">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">LumenForge</span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </nav>
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} LumenForge. Built for freelancers.
          </span>
        </div>
      </footer>
    </div>
  );
}
