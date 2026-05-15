import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">LumenForge</span>
          </Link>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto max-w-3xl w-full px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight mb-4">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, "0")}-01</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <p>
            By using LumenForge (&ldquo;the Platform&rdquo;), you agree to these Terms of Service.
            Please read them carefully before using our services.
          </p>

          <h2 className="text-lg font-semibold mt-8">1. Acceptance of Terms</h2>
          <p>
            By creating an account or using the Platform, you agree to be bound by these terms.
            If you do not agree, please do not use the Platform.
          </p>

          <h2 className="text-lg font-semibold mt-8">2. Account Responsibilities</h2>
          <p>
            You are responsible for maintaining the security of your account credentials and for all activities
            that occur under your account. You must provide accurate information when creating your account.
          </p>

          <h2 className="text-lg font-semibold mt-8">3. Acceptable Use</h2>
          <p>
            You agree not to misuse the Platform, including but not limited to: violating any laws,
            attempting unauthorized access, interfering with the Platform&apos;s operation, or using the Platform
            for any illegal or harmful purpose.
          </p>

          <h2 className="text-lg font-semibold mt-8">4. Intellectual Property</h2>
          <p>
            The Platform and its original content, features, and functionality are owned by LumenForge
            and are protected by international copyright and intellectual property laws.
          </p>

          <h2 className="text-lg font-semibold mt-8">5. Limitation of Liability</h2>
          <p>
            The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. We are not liable for
            any damages arising from your use of the Platform, to the fullest extent permitted by law.
          </p>

          <h2 className="text-lg font-semibold mt-8">6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Continued use of the Platform after
            changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-lg font-semibold mt-8">7. Termination</h2>
          <p>
            We may terminate or suspend your account at any time for violations of these terms or for any
            other reason at our sole discretion.
          </p>
        </div>
      </main>
    </div>
  );
}
