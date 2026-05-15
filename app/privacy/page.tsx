import Link from "next/link";
import { Briefcase, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, "0")}-01</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed">
          <p>
            LumenForge (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
          </p>

          <h2 className="text-lg font-semibold mt-8">1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including your name, email address, and account details through Clerk authentication.
            We also collect project data, client information, invoices, and task data you enter into the platform.
          </p>

          <h2 className="text-lg font-semibold mt-8">2. How We Use Your Information</h2>
          <p>
            We use your information to provide, maintain, and improve our services, including project management, client communication,
            invoicing, and AI-powered assistance. We do not sell your personal information.
          </p>

          <h2 className="text-lg font-semibold mt-8">3. Data Storage and Security</h2>
          <p>
            Your data is stored securely using industry-standard encryption. All connections to our platform use HTTPS.
            We implement rate limiting, input validation, and access controls to protect your information.
          </p>

          <h2 className="text-lg font-semibold mt-8">4. Third-Party Services</h2>
          <p>
            We use Clerk for authentication services, Groq for AI processing, and may use Turso for database hosting.
            These services have their own privacy policies governing the handling of your data.
          </p>

          <h2 className="text-lg font-semibold mt-8">5. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You can manage your account settings
            through the platform or contact us for assistance.
          </p>

          <h2 className="text-lg font-semibold mt-8">6. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us through the platform&apos;s support channels.
          </p>
        </div>
      </main>
    </div>
  );
}
