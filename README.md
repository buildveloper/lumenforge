# LumenForge

**The workspace your clients can see.**

Projects, tasks, and invoices for independent professionals, plus a client portal
they can log into. Clients stop asking for updates; you stop writing them.

---

## What it does

### For the freelancer
- **Clients** — a directory with contact details, open work, and what each client owes.
- **Projects** — scope, budget, and deadline, with task progress rolling up automatically.
- **Tasks** — a Kanban board you can drag with a mouse *or* a keyboard, plus a
  single list of everything open across every project.
- **Invoices** — numbered from your own sequence (`INV-2026-001`), tracked from
  draft through sent to paid, with late invoices surfaced on the overview.
- **Overview** — what needs attention now: overdue money, deadlines, and open work.
- **Activity** — an append-only audit trail of every change, filterable by type.

### For the client
- Sign up with the email address already on their client record and the work
  links itself. No invitations to send.
- Progress on every shared project, invoices addressed to them, and one button to
  approve a deliverable or request changes — which notifies the freelancer.

### AI
- Real token streaming, not a fake typing animation.
- Drafts are grounded in the project's actual tasks, invoices, budget, and
  deadline. Nothing outside the account is visible to the model.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) — App Router, Server Components, Server Actions |
| Language | [TypeScript](https://www.typescriptlang.org) — strict |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) + `@tailwindcss/typography` |
| Motion | [`motion`](https://motion.dev) v13, via `LazyMotion`, split by route group |
| Auth | Built in — email + password, scrypt hashing, DB-backed sessions |
| Database | [Drizzle ORM](https://orm.drizzle.team) + libSQL ([Turso](https://turso.tech) in production) |
| AI | [Groq](https://groq.com) — `llama-3.3-70b-versatile`, streamed through a route handler |
| Drag & drop | [`@dnd-kit`](https://dndkit.com) with a keyboard sensor |
| Validation | [Zod](https://zod.dev) on every mutation input |
| Icons | [Lucide](https://lucide.dev) |
| Toasts | [Sonner](https://sonner.emilkowal.ski), unstyled and driven by our tokens |

---

## Design

Read [`DESIGN.md`](./DESIGN.md). It is the source of truth and it explains the
reasoning, not just the values.

The short version: warm charcoal and brass, where **brass marks where you are**
and never fills a button. Mono for money and identifiers. Depth from a lightness
step and a hairline border rather than a drop shadow. Radius 3/5/7/10. Two
status glyph-plus-label systems so meaning never depends on colour alone.

---

## Quick start

### Prerequisites

- **Node.js** 20+
- A libSQL database — a local SQLite file is fine, or [Turso](https://turso.tech)
- A **Groq** API key — [console.groq.com](https://console.groq.com) (optional;
  the AI panel shows an honest "not configured" state without it)

No third-party auth account is needed. Sign-in is part of the app.

### 1. Install

> If `NODE_ENV=production` is set in your shell, npm skips devDependencies
> silently. Use `--include=dev`.

```bash
git clone https://github.com/your-org/lumenforge.git
cd lumenforge
npm install --include=dev
```

### 2. Environment

```bash
cp .env.example .env
```

| Variable | Required | Notes |
|---|---|---|
| `TURSO_DATABASE_URL` | yes | `file:./data/lumenforge.db` locally |
| `TURSO_AUTH_TOKEN` | in production | Empty for local SQLite |
| `GROQ_API_KEY` | no | AI features are disabled without it |
| `NEXT_PUBLIC_APP_URL` | in production | Your deployed URL |

### 3. Database

```bash
npm run db:migrate     # apply the versioned migrations
```

The app creates the `data/` directory on first run, so there is nothing to make
by hand. `npm run db:push` also works during development, and
`npm run db:studio` opens Drizzle Studio.

If sign-in reports that it cannot reach the database, this step is the one to
re-run.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and pick
a role. Nothing is deleted if you switch roles later.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate a migration from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push the schema directly (development) |
| `npm run db:studio` | Drizzle Studio |

---

## How a request is handled

1. The button calls a Server Action.
2. The action resolves identity through `requireUserId()` in
   `server/helpers/session.ts`, which is `cache()`d so one page load does not
   issue twelve identical lookups.
3. Input is parsed with Zod before it reaches the database.
4. Ownership is verified against the record, not the request.
5. The write happens, with soft-delete semantics.
6. `logActivity` records it, and `createNotification` fires when someone else
   needs to know.
7. `revalidatePath` refreshes every affected route.

Client-scoped reads resolve through `server/helpers/client-access.ts`, which is
the only place that maps a signed-in account to a client record.

---

## Not built

Stated plainly rather than implied: **no email verification**, **no password
reset**, **no online payment collection**, no PDF invoice export, no outbound
email, no realtime updates, no file attachments, no time tracking, no
multi-tenant or agency support, and no `/admin` surface.

Email verification and password reset are both missing for the same reason:
there is no email provider. Adding one is the prerequisite for either, and
faking it would be worse than not having it. The sign-up page says so.

Invoices track what is owed and what has been paid; collecting the money still
happens wherever you already do it. The `api_keys` table is unused scaffolding.

## Authentication

Built in, with no third-party identity provider.

- **Passwords** are hashed with scrypt from `node:crypto` using a per-account
  salt. The cost parameters are stored alongside each hash, so they can be
  raised later without invalidating existing accounts.
- **Sessions** are rows in the `sessions` table, so signing out invalidates
  immediately rather than waiting for a cookie to expire. Only the SHA-256 of a
  token is stored: a database leak does not hand over usable sessions.
- **Cookies** are `httpOnly`, `SameSite=Lax`, and `Secure` in production.
- **Sign-in** does not reveal whether an email is registered — a missing account
  and a wrong password return the same message and take the same time.
- **Brute force** is throttled per account, on top of the per-IP limit in
  `proxy.ts`.
- **Changing a password** signs out every other device.

---

## Deployment (Vercel)

### Without a database configured

The app deploys and runs with no database variables, but read what that means
before relying on it.

Vercel's deployment filesystem is read-only, so `./data/lumenforge.db` cannot
exist there. When `TURSO_DATABASE_URL` is unset and the app detects a serverless
host, it falls back to SQLite in `/tmp` — the one writable path — and applies the
schema automatically on first use.

`/tmp` belongs to the instance. When the instance recycles the data is gone, and
two instances running at once do not share a database. That is fine for a demo
and wrong for anything real. The server log says so on every cold start.

### With Turso (persistent)

This is the only mode where data survives.

1. Create a database at [turso.tech](https://turso.tech). The free tier is
   plenty for this.
2. In Vercel → Settings → Environment Variables, set:
   - `TURSO_DATABASE_URL` — the `libsql://…` URL
   - `TURSO_AUTH_TOKEN` — the token
3. Apply the schema to it once, from your machine:

   ```bash
   TURSO_DATABASE_URL="libsql://…" TURSO_AUTH_TOKEN="…" npm run db:migrate
   ```

4. Redeploy. The app applies any pending migrations itself on first use, against
   every kind of database, so this step is a belt-and-braces check rather than a
   requirement.

Also set `NEXT_PUBLIC_APP_URL` to your production URL, and `GROQ_API_KEY` if you
want the AI features.

---

## Troubleshooting

**"The database is missing users.password_hash…"**

The database has tables but not the current schema. This happens when the tables
were created by `drizzle-kit push` rather than by migrations: push writes no
migration history, so the app's own `migrate()` has nothing to apply and cannot
bring the schema forward.

Fix it in place, without dropping anything:

```bash
TURSO_DATABASE_URL="libsql://…" TURSO_AUTH_TOKEN="…" npx drizzle-kit push
```

Pointing the app at an empty database also works, since it will build the schema
itself.

**"That database address does not exist" / "The database refused the token"**

`TURSO_DATABASE_URL` or `TURSO_AUTH_TOKEN` is wrong in your host's environment
variables. Changing them requires a redeploy.

**Sign-up worked, but the account is gone later**

No `TURSO_DATABASE_URL` is configured, so the app is using SQLite in `/tmp`,
which resets when the instance recycles. See the deployment section above.

**`npm run db:migrate` prints nothing**

A running dev server can hold a lock on the local SQLite file. Stop it first.

---

## License

MIT © LumenForge
