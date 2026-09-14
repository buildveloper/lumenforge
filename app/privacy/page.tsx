import Link from "next/link";

import { LegalLayout } from "@/components/marketing/legal-layout";

export const metadata = { title: "Privacy" };

const UPDATED = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
}).format(new Date());

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy policy" updated={UPDATED}>
      <p>
        LumenForge stores the business records you enter: clients, projects,
        tasks, invoices, and the activity log of changes to them. This page says
        plainly what is collected, where it goes, and what you can do about it.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>
          <strong>Account details</strong> — your name, email address, and
          profile image, provided through Clerk when you sign up.
        </li>
        <li>
          <strong>Records you create</strong> — clients, projects, tasks,
          invoices, and notes.
        </li>
        <li>
          <strong>An audit trail</strong> — every change to those records, with
          a timestamp and the account that made it. Nothing is edited out of it.
        </li>
        <li>
          <strong>Technical data</strong> — IP address for rate limiting, and
          standard server logs.
        </li>
      </ul>

      <h2>What we do with it</h2>
      <p>
        We run the product with it. We do not sell it, rent it, or use your
        client records to train anything. There is no advertising in LumenForge
        and no third-party analytics script on these pages.
      </p>

      <h2>Who else sees it</h2>
      <ul>
        <li>
          <strong>Clerk</strong> handles authentication. Your password never
          reaches our servers.
        </li>
        <li>
          <strong>Groq</strong> processes AI requests. When you generate a
          draft, the relevant project context — project details, task list, and
          invoice lines — is sent to Groq to produce it. If you never use the AI
          features, nothing is sent.
        </li>
        <li>
          <strong>Your database host</strong> stores the records. Locally that
          is a SQLite file; in production it is a libSQL/Turso database.
        </li>
      </ul>

      <h2>Deletion</h2>
      <p>
        Deleting a record in LumenForge removes it from your workspace
        immediately, and the undo window lets you bring it back. Underlying rows
        are retained so the audit trail stays intact. To erase an account and
        everything in it, get in touch and it will be removed.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, correct, export, or delete your data. Most of it is
        editable in the product; for anything else, contact us and we will
        handle it.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy go to the address in the footer of the site
        you signed up from.
      </p>

      <p>
        See also our <Link href="/terms">terms of service</Link>.
      </p>
    </LegalLayout>
  );
}
