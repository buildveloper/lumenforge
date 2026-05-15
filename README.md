# LumenForge

**Run your freelance business in one place.**

A premium, AI-enhanced Freelancer & Client Portal SaaS — combining project management, professional invoicing, client portals, and AI assistance into one beautiful, secure workspace. Built for freelancers commanding $40k+ engagements.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## ✨ Live Demo

> 🚧 _Coming soon — deployment link will be added here._

---

## 📸 Screenshots

| | | |
|:---:|:---:|:---:|
| _Dashboard_ | _Project Kanban_ | _Invoice Detail_ |
| ![Dashboard](screenshots/dashboard.png) | ![Kanban](screenshots/kanban.png) | ![Invoice](screenshots/invoice.png) |
| _AI Assistant_ | _Client Portal_ | _Activity Feed_ |

> 📸 _Screenshots placeholder — add your own shots in `/screenshots/`_

---

## 🎯 Features

### 🏠 Role-Based Dashboards
Two distinct experiences in one app — freelancers see revenue, active projects, and tasks due this week; clients see project progress, pending invoices, and recent updates. Everything filtered by ownership at the database level.

### 📋 Full Project Management
Create projects with budgets, due dates, and client assignments. Each project gets a **Kanban board** with drag-and-drop task management powered by `@dnd-kit`. Columns for Todo, In Progress, Review, and Done — with priority badges, assignee labels, and due dates on every card.

### 💰 Professional Invoicing
Auto-generated invoice numbers (`INV-2026-001`), status workflows (draft → sent → paid → overdue → cancelled), and clean detail views with large-format amounts. All invoices support notes/line items, client and project linking, and paid-at timestamps.

### 🤖 AI Assistant
Generative AI powered by **Groq** (Llama 3.3 70B). Generate project proposals, progress summaries, task breakdowns, and polished descriptions — all context-aware from your project data. Every generation is logged in the activity feed.

### 🔔 Activity & Notifications
A merged timeline of every mutation in your workspace — who created what, what changed status, what got deleted. Notification bell with unread counts and mark-all-as-read. Complete audit trail.

### 🔒 Secure & Private
Clerk authentication with middleware-level route protection. Every server action verifies identity and ownership before touching data. All input validated with Zod. Soft deletes on every entity. Rate limiting on all routes. CSP headers, HSTS, and secure defaults out of the box.

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) — App Router, Server Components, Server Actions |
| **Language** | [TypeScript](https://www.typescriptlang.org) — strict mode, full type safety |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) — dark mode default, indigo theme |
| **Auth** | [Clerk](https://clerk.com) — social login, MFA, organization support |
| **Database** | [Turso](https://turso.tech) (libSQL) + [Drizzle ORM](https://orm.drizzle.team) — edge-ready SQLite |
| **AI** | [Groq](https://groq.com) — Llama 3.3 70B, sub-second inference |
| **Drag & Drop** | [`@dnd-kit`](https://dndkit.com) — Kanban task reordering |
| **Validation** | [Zod](https://zod.dev) — schema validation on every input |
| **Icons** | [Lucide React](https://lucide.dev) — consistent iconography |
| **Toasts** | [Sonner](https://sonner.emilkowal.ski) — beautiful, accessible notifications |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **Clerk account** — [dashboard.clerk.com](https://dashboard.clerk.com)
- **Turso account** — [turso.tech](https://turso.tech) (or use local SQLite)
- **Groq API key** — [console.groq.com](https://console.groq.com) (optional; AI features disabled without it)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/lumenforge.git
cd lumenforge
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Fill in your keys:

```env
# Required — get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Required — local SQLite or Turso URL
TURSO_DATABASE_URL=file:./data/lumenforge.db
# TURSO_DATABASE_URL=libsql://your-db.turso.io  # Production

# Required for Turso production; leave empty for local SQLite
TURSO_AUTH_TOKEN=

# Optional — AI features disabled without this
GROQ_API_KEY=gsk_...

# Required for production — your deployed URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database

```bash
# Push schema (dev — creates/updates tables directly)
npx drizzle-kit push

# Or generate + apply migrations (production workflow)
npm run db:generate
npm run db:migrate
```

### 4. Start Developing

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign up with Clerk, choose your role (Freelancer or Client), and you're in.

---

## 📂 Project Structure

```
├── app/
│   ├── (auth)/                  # Clerk sign-in / sign-up pages
│   ├── dashboard/
│   │   ├── layout.tsx           # Sidebar + auth gate + role selector
│   │   ├── page.tsx             # Stats dashboard (role-aware)
│   │   ├── clients/             # Client directory
│   │   ├── projects/
│   │   │   ├── page.tsx         # Project list
│   │   │   └── [id]/page.tsx    # Project detail + Kanban + Invoices + AI
│   │   ├── invoices/
│   │   │   ├── page.tsx         # Invoice list with filters
│   │   │   └── [id]/page.tsx    # Invoice detail
│   │   ├── tasks/               # Global task view
│   │   └── activity/            # Merged activity + notification feed
│   ├── settings/                # Profile, security, notifications, billing
│   ├── privacy/                 # Privacy Policy
│   ├── terms/                   # Terms of Service
│   ├── layout.tsx               # Root: Clerk + Theme + Toaster + SEO
│   └── page.tsx                 # Marketing landing page
├── components/
│   ├── ui/                      # shadcn/ui primitives
│   ├── dashboard/               # Sidebar, StatusBadge, Breadcrumbs
│   ├── kanban/                  # KanbanBoard, KanbanColumn, TaskCard
│   ├── ai/                      # AIAssistant, QuickAIActions
│   └── notifications/           # NotificationBell
├── db/
│   ├── schema.ts                # 9 tables: users, clients, projects, invoices, tasks, etc.
│   └── migrations/              # Versioned SQL migrations
├── server/
│   ├── actions/                 # Server Actions (9 files, 43 functions)
│   └── helpers/                 # Internal DB helpers (not exposed as server actions)
├── lib/
│   ├── db.ts                    # Turso/libSQL connection
│   ├── validation.ts            # Zod schemas for every entity
│   ├── ai.ts                    # Groq client singleton
│   └── utils.ts                 # cn() classname merger
├── middleware.ts                 # Clerk auth guard + rate limiter
├── next.config.ts                # CSP, HSTS, security headers
└── drizzle.config.ts             # Drizzle Kit configuration
```

---

## 🔐 Security

LumenForge was built with security as a first-class concern, not an afterthought.

| Layer | Implementation |
|-------|---------------|
| **Authentication** | Clerk middleware on all non-public routes (`/dashboard/*`, `/settings`, `/admin/*`) |
| **Authorization** | Every server action (43 total) verifies `userId` and checks resource ownership before mutations |
| **Input Validation** | Zod schemas on every mutation input — no raw user input touches the database |
| **SQL Injection** | Drizzle ORM with parameterized queries — impossible to inject |
| **Soft Deletes** | `deletedAt` columns on clients, projects, tasks, invoices — nothing is ever hard-deleted |
| **Audit Trail** | `activity_logs` table records every mutation with user, action, entity type, and timestamp |
| **CSP Headers** | Strict Content-Security-Policy in `next.config.ts` |
| **Rate Limiting** | 60 requests/minute per IP in middleware |
| **Security Headers** | HSTS (2-year max-age), X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy |
| **Secrets** | `.env` in `.gitignore` — no secrets committed; `.env.example` for documentation |
| **Error Boundaries** | Route-level and global error boundaries — no stack traces leaked to users |

```bash
npm audit        # Run to verify dependencies
npm run build    # Production build check
```

---

## 🗄️ Database Commands

| Command | Purpose |
|---------|---------|
| `npm run db:push` | Push schema directly to database (development) |
| `npm run db:generate` | Generate migration SQL from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:studio` | Launch Drizzle Studio for visual browsing |

The local SQLite database lives at `./data/lumenforge.db`. For production, set `TURSO_DATABASE_URL` to your Turso libSQL URL and add `TURSO_AUTH_TOKEN`.

---

## 🚢 Deployment (Vercel)

1. Push your code to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Add all environment variables in **Settings → Environment Variables**
4. Deploy

**Pre-flight checklist:**
- [ ] Set `NEXT_PUBLIC_APP_URL` to your production domain
- [ ] Configure Turso production credentials
- [ ] Rotate Clerk keys to production environment
- [ ] Add `GROQ_API_KEY` if using AI features
- [ ] Run `npm run build` locally to verify production build
- [ ] Review security headers in `next.config.ts`

---

## 🗺️ Roadmap

| Status | Feature |
|--------|---------|
| ✅ Done | Role-based dashboards (Freelancer & Client) |
| ✅ Done | Full project management with Kanban |
| ✅ Done | Professional invoicing with status workflows |
| ✅ Done | AI assistant (proposals, summaries, task breakdowns) |
| ✅ Done | Activity feed + notification system |
| ✅ Done | Soft deletes + full audit trail |
| ✅ Done | Security: auth, ownership, Zod, CSP, rate limiting |
| 🔲 Planned | Stripe payment integration |
| 🔲 Planned | PDF invoice generation & download |
| 🔲 Planned | Email notifications (Resend / SendGrid) |
| 🔲 Planned | Real-time updates (WebSocket / SSE) |
| 🔲 Planned | File attachments on projects & tasks |
| 🔲 Planned | Time tracking & timesheets |
| 🔲 Planned | Advanced analytics & reporting |
| 🔲 Planned | PWA / mobile app support |
| 🔲 Planned | Multi-tenant / agency support |

---

## 💡 Design Philosophy

> Think **Linear**, **Vercel**, **Stripe**, **Raycast**. Premium SaaS, not a side project.

- **Dark mode by default** — deep zinc/slate backgrounds with indigo/blue accents
- **Generous whitespace** — content breathes, cards have presence
- **Consistent typography** — Geist font, clear hierarchy, `tabular-nums` for numbers
- **Mobile-first** — hamburger sidebar, horizontal-scroll Kanban, responsive grids
- **Meaningful micro-interactions** — hover states, loading skeletons, toast feedback, optimistic updates with rollback

---

## 🧑‍💻 Built for

Freelancers and small agencies who manage high-value client engagements and want one beautiful, secure tool instead of juggling 5 different apps. No more spreadsheets, no more scattered invoices, no more "let me check my other tool."

---

## 📄 License

MIT © LumenForge
