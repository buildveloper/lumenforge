import Link from "next/link";

import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = { title: "Terms" };

const UPDATED = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
}).format(new Date());

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of service" updated={UPDATED}>
      <p>
        These terms cover your use of LumenForge. By creating an account you
        agree to them. They are written to be read rather than skimmed past.
      </p>

      <h2>The service</h2>
      <p>
        LumenForge is a workspace for running client engagements: a client
        directory, projects and tasks, invoices with status tracking, an
        activity log, and optional AI drafting. Features may change, and
        anything in beta is marked as such.
      </p>

      <h2>Your account</h2>
      <p>
        You are responsible for what happens under your account and for keeping
        your sign-in credentials secure. Authentication is handled by Clerk. You
        must be old enough to enter a contract where you live.
      </p>

      <h2>Your data is yours</h2>
      <p>
        You own the records you put in. We claim no rights over your client
        data, project material, or invoice content, and we do not use it to
        train models. The AI features send the context needed for the request
        you made to our model provider and nothing more.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not use LumenForge to break the law or to store unlawful material.</li>
        <li>Do not attempt to access accounts or records that are not yours.</li>
        <li>Do not probe, overload, or circumvent the service&rsquo;s rate limits.</li>
        <li>Do not resell the service as your own.</li>
      </ul>

      <h2>Client access</h2>
      <p>
        If you invite a client to view a project, you are responsible for having
        the right to share that information with them. Portal access is limited
        to records linked to the client&rsquo;s own email address.
      </p>

      <h2>AI output</h2>
      <p>
        Drafts produced by the AI are suggestions, not advice. Read them before
        you send them to a client. You are responsible for anything you publish
        or bill under your name.
      </p>

      <h2>Availability and liability</h2>
      <p>
        LumenForge is provided as is. We work to keep it available and your data
        intact, but we do not promise uninterrupted service, and our liability is
        limited to the amount you have paid us.
      </p>

      <h2>Ending your use</h2>
      <p>
        You may stop using LumenForge at any time. We may suspend an account
        that breaks these terms, and will tell you why.
      </p>

      <h2>Changes</h2>
      <p>
        If these terms change materially, the update date above changes with
        them.
      </p>

      <p>
        See also our <Link href="/privacy">privacy policy</Link>.
      </p>
    </LegalLayout>
  );
}
