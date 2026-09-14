/**
 * Every string on the marketing site lives here, so copy can be reviewed and
 * changed without touching layout. Claims are limited to what the product
 * actually does.
 */

export const NAV_LINKS = [
  { href: "#workflow", label: "How it works" },
  { href: "#portal", label: "Client portal" },
  { href: "#security", label: "Security" },
  { href: "#pricing", label: "Pricing" },
];

export const HERO = {
  eyebrow: "For freelancers and small studios",
  headline: "The workspace your clients can see.",
  subhead:
    "Projects, tasks, and invoices in one place, plus a portal they can log into. They stop asking for updates. You stop writing them.",
  primaryCta: { href: "/sign-up", label: "Start free" },
  secondaryCta: { href: "#workflow", label: "See how it works" },
  footnote: "Free, with every feature included. No card required.",
};

export const POSITIONING = {
  lead: "Three tools, finally in one place",
  items: [
    "Your client directory",
    "Your project board",
    "Your invoice tracker",
  ],
  note: "Same records underneath, so a task, an invoice, and a client are never out of step.",
};

export const WORKFLOW = {
  eyebrow: "How it works",
  title: "One engagement, start to paid.",
  body: "Each step writes to the same record, which is why the client portal and the activity log are never out of date.",
  steps: [
    {
      key: "client",
      label: "Add the client",
      body: "Name, company, and email. The email is what lets them claim portal access later.",
    },
    {
      key: "project",
      label: "Start the project",
      body: "Scope, budget, and a deadline in one record you can send them.",
    },
    {
      key: "board",
      label: "Break it into tasks",
      body: "Drag work across To do, In progress, Review, and Done. Progress rolls up automatically.",
    },
    {
      key: "ai",
      label: "Draft the update",
      body: "The assistant reads the tasks, invoices, and deadline, then writes the summary you would have written.",
    },
    {
      key: "invoice",
      label: "Raise the invoice",
      body: "Numbered from your own sequence, tracked from draft to paid, with the amount still owed on the overview.",
    },
  ],
} as const;

export const DIFFERENTIATORS = {
  eyebrow: "What is different",
  title: "Three things most tools in this space get wrong.",
  items: [
    {
      title: "One workspace for the whole engagement",
      body: "Client, project, tasks, and invoices are the same set of records. There is no syncing between them and no second app holding the truth.",
      detail: "A project's invoices, tasks, and conversation in one screen.",
    },
    {
      title: "AI that has read the project",
      body: "Drafts are grounded in your actual task list, budget, deadline, and invoice status — not a blank chat box guessing at your business.",
      detail: "Proposals, progress summaries, and task breakdowns from real data.",
    },
    {
      title: "An audit trail you can show a client",
      body: "Every change is written to an append-only log with a timestamp. Nothing is edited out of it, which ends most scope arguments before they start.",
      detail: "Who changed what, and when, across the whole workspace.",
    },
  ],
} as const;

export const PORTAL = {
  eyebrow: "Client portal",
  title: "Your client gets a login, not another PDF.",
  body: "They sign up with the email address already on their client record, and the work links itself. No invitations to send, no access to configure.",
  points: [
    "Progress on every project shared with them",
    "Invoices addressed to them, with status",
    "One button to approve a deliverable or ask for changes",
    "A notification straight to you either way",
  ],
} as const;

export const SECURITY = {
  eyebrow: "Security",
  title: "Built so that a mistake on the client is only a mistake on the client.",
  body: "Client records are the most sensitive thing here. These are not aspirations; each one is visible in the running product.",
  items: [
    {
      title: "Ownership checked on every action",
      body: "Each of the server actions verifies the signed-in account against the record before it reads or writes.",
    },
    {
      title: "Validated input, parameterised queries",
      body: "Every mutation is parsed against a schema before it reaches the database, and every query is parameterised.",
    },
    {
      title: "Deletes are reversible",
      body: "Nothing is hard-deleted. Removing a record hides it immediately and the undo window brings it back.",
    },
    {
      title: "Restrictive security headers",
      body: "A content security policy, HSTS, and frame, referrer, and permissions policies ship on by default.",
    },
  ],
} as const;

export const PRICING = {
  eyebrow: "Pricing",
  title: "Free, and everything is in it.",
  body: "One tier. No trial that expires, no feature held back to upsell later, no card on file.",
  price: "$0",
  period: "forever",
  features: [
    "Unlimited clients, projects, and tasks",
    "Invoices numbered from your own sequence",
    "Client portal access for everyone you work with",
    "AI drafting and progress summaries",
    "Full activity log and audit trail",
  ],
  cta: { href: "/sign-up", label: "Create your account" },
  caveat:
    "Invoices track status and what is owed. Taking payment online is not built yet, and neither is PDF export — so we do not claim them.",
} as const;

export const FAQ = {
  eyebrow: "Questions",
  title: "The things people ask before signing up.",
  items: [
    {
      q: "Do I have to invite my clients?",
      a: "No. Add a client and put their email address on the record. When someone signs up with that address, the work already pointing at it appears in their portal. If they never sign up, nothing breaks.",
    },
    {
      q: "What happens to my data if I stop using it?",
      a: "Your records stay yours. Nothing is deleted for inactivity, and deleting something in the product is reversible during the undo window. You can ask for a full export at any time.",
    },
    {
      q: "Is my client data sent anywhere?",
      a: "Only to your own database. The exception is the AI features: when you generate a draft, the project's details, tasks, and invoice lines are sent to our model provider to produce it. Skip the AI and nothing leaves your database.",
    },
    {
      q: "Does it work on a phone?",
      a: "Yes. The board, the invoice list, and the portal are all built for small screens, with navigation in the bottom third of the screen where your thumb actually is.",
    },
    {
      q: "Can I take payments through it?",
      a: "Not yet. Invoices track what is owed, what has been sent, and what has been paid, so you always know where you stand. Collecting the money still happens wherever you already do it.",
    },
    {
      q: "What is the AI actually working from?",
      a: "The project you are looking at: its scope, status, budget, deadline, task list, and invoices. It cannot see other clients' work, and it cannot see anything outside your account.",
    },
  ],
} as const;

export const TESTIMONIALS = {
  /**
   * Placeholders. Replace with real quotes before promoting the site, and
   * delete the `sample` flag below when you do — the section renders a visible
   * marker for as long as it is set.
   */
  sample: true,
  eyebrow: "What users say",
  title: "Sample quotes",
  body: "These are placeholder quotes kept for layout. They are not real customers, and they say so on the page.",
  items: [
    {
      quote:
        "Replaced three tools I was juggling. Clients see progress and pay invoices from one place, and I stopped writing status emails entirely.",
      name: "Sample quote",
      role: "UX designer and consultant",
    },
    {
      quote:
        "The overview tells me what is owed and what is late before I have to go looking. That alone was worth switching for.",
      name: "Sample quote",
      role: "Independent developer",
    },
    {
      quote:
        "My clients think I have an operations team. It is me, a laptop, and this.",
      name: "Sample quote",
      role: "Brand strategist",
    },
  ],
} as const;

export const FINAL_CTA = {
  title: "Run every engagement from one place.",
  body: "Free, everything included. Bring one client across and see whether your next status email is still necessary.",
  cta: { href: "/sign-up", label: "Start free" },
  secondary: { href: "/sign-in", label: "Sign in" },
} as const;

export const FOOTER = {
  tagline: "The workspace your clients can see.",
  columns: [
    {
      title: "Product",
      links: [
        { href: "#workflow", label: "How it works" },
        { href: "#portal", label: "Client portal" },
        { href: "#security", label: "Security" },
        { href: "#pricing", label: "Pricing" },
      ],
    },
    {
      title: "Account",
      links: [
        { href: "/sign-in", label: "Sign in" },
        { href: "/sign-up", label: "Create account" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy" },
        { href: "/terms", label: "Terms" },
      ],
    },
  ],
} as const;
