# LumenForge — AI Agent Instructions

## Project Overview

LumenForge is a workspace for independent professionals running client
engagements. Freelancers keep clients, projects, tasks, and invoices in one
place; their clients get a portal login instead of another status email.

It is positioned as a real product, not a portfolio piece. Copy, claims, and
pricing should read that way.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 + shadcn/ui + `@tailwindcss/typography`
- **Motion**: `motion` (v13) via `LazyMotion`, split by route group
- **Auth**: built in — email + password, scrypt hashing, DB-backed sessions
- **Database**: Drizzle ORM + libSQL (local SQLite file, Turso in production)
- **AI**: Groq (`llama-3.3-70b-versatile`), streamed through a route handler
- **Deployment**: Vercel

## Design — read DESIGN.md first

`DESIGN.md` is the source of truth for colour, type, geometry, motion, states,
accessibility, and marketing rules. Read it before touching anything visual.

The short version, so you do not undo it by accident:

- **Warm charcoal + brass.** Brass is a signal (focus, active nav, highlighted
  row, one CTA), never a button fill. Primary buttons are ink.
- **Mono for money and identifiers only** (`<Num>` or the `num` utility).
- **Depth is a lightness step plus a hairline border.** No card has a shadow.
- **Radius is 3/5/7/10.** Not 12px on everything.
- **Six `StatusBadge` implementations were collapsed into one `StatusChip`.**
  Use it. Never write a local status component.
- **Every status carries a glyph and a label**, not just a colour.
- **Use the primitives** in `components/app/`. Extend them rather than making a
  local variant.
- **No dead controls.** No disabled placeholder buttons, no links to routes that
  do not exist, no "coming soon" panels.
- **Delete with undo, not with a confirmation dialog.** `withUndo()`.
- **Never disable a submit button because the form is invalid.** Surface a
  field-level error on submit instead.

## Security Rules (Non-Negotiable)

- Never trust the client. All authorization is server-side.
- Every server action resolves identity through `requireUserId()` and checks
  ownership of the record before reading or writing.
- Validate every mutation input with Zod (`lib/validation.ts`).
- Soft deletes everywhere (`deletedAt`). Every delete has a matching restore.
- Parameterized queries only (Drizzle handles this).
- Rate limiting lives in `middleware.ts` — respect it.
- Never expose sensitive data to client components.
- Log critical actions to `activity_logs`.

## Folder Structure

```
app/globals.css        All design tokens — colour, radius, type, motion
app/(marketing)/       Landing page (display serif is scoped to this group)
app/(auth)/            Sign in / sign up with the brand panel
app/dashboard/         The authenticated app
app/api/ai/stream/     Token streaming route handler
components/app/        Shell + primitives (rail, top bar, palette, StatusChip,
                       Num, StatTile, PageShell, Field, EmptyState, ErrorState,
                       Segmented, FilterLinks, withUndo, motion provider)
components/ui/         shadcn primitives, retuned to the tokens
components/dashboard/  Record views, one form dialog per record type
components/kanban/     Board, column, card, task form
components/marketing/  Landing sections
components/charts/     Hand-rolled SVG charts (no charting library)
components/brand/      The Aperture mark
content/site.ts        Every marketing string
db/schema.ts           All Drizzle schemas
lib/format.ts          Money, dates, deadlines — the only formatter
lib/status.ts          Status tones and activity labels — the only map
server/actions/        Server Actions
server/helpers/        session, client-access, ai-context, log-activity
```

## Coding Guidelines

- Prefer **Server Components** and **Server Actions**. Add `"use client"` where
  there is interaction, not by reflex.
- Proper TypeScript. No `any`.
- Actions return `{ success: true, ... }` or throw. They do not return a
  `{ success: false, error }` envelope — callers catch.
- Identity comes from `server/helpers/session.ts`, which wraps the session lookup
  in React `cache()` so a page load issues one query, not twelve. Never store a
  raw session token: only its SHA-256 goes in the database.
- `proxy.ts` is a cookie presence check and rate limiter, never the
  authorization boundary. Every page and action re-validates through
  `requireUserId()`.
- Client-scoped reads resolve through `server/helpers/client-access.ts`. Never
  compare a `clients.id` against a user id.
- `revalidatePath` (or `revalidateTag`) after every mutation.
- Names describe the action: `createProject`, `getUserProjects`, `restoreInvoice`.

## Feature Workflow

1. Button → Zod validation on the server
2. Server Action → identity + ownership check
3. Database operation with soft-delete semantics
4. `logActivity` entry, and `createNotification` when someone else needs to know
5. `revalidatePath` on every affected route
6. Toast naming the record, or an undo affordance for a delete

## Deliberately not built

Do not imply any of these exist: online payment collection (Stripe), PDF invoice
export, outbound email, **email verification, password reset**, realtime updates,
file attachments, time tracking, multi-tenant/agency support, or an `/admin`
surface. The `api_keys` table is unused scaffolding.

There is no email verification and no password reset, because neither is
possible without an email provider. The sign-up page says so rather than
pretending otherwise.

## One deliberate exception

Auth actions return `{ ok: false, error }` instead of throwing. A wrong password
is an expected outcome that needs a specific message, and Next redacts thrown
error messages from Server Actions in production. Every other action follows the
throw-or-`{ success: true }` rule.

## Known environment notes

- `NODE_ENV=production` may be set in the shell, which makes npm skip
  devDependencies silently. Use `npm install --include=dev`.
- `middleware.ts` triggers a Next 16 deprecation warning suggesting `proxy.ts`.
  Left as-is on purpose: it is the auth layer and works.
