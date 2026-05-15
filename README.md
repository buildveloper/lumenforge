# LumenForge

**Run your freelance business in one place.**

Client management, project tracking, invoicing, and tasks — beautifully integrated for independent professionals.

## Stack

- **Framework:** Next.js 16 (App Router) with React 19 Server Components
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui (Indigo theme, dark mode default)
- **Database:** SQLite via better-sqlite3 (Turso/libSQL-ready)
- **ORM:** Drizzle ORM with generated migrations
- **Auth:** Clerk (middleware-based route protection)
- **Validation:** Zod schemas
- **Icons:** Lucide React

## Getting Started

```bash
# 1. Clone and install
git clone <repo-url> lumenforge
cd lumenforge
npm install

# 2. Set up environment
cp .env.example .env
# Add your Clerk keys from https://dashboard.clerk.com

# 3. Generate and run migrations
npm run db:generate
npm run db:migrate

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

| Command | Description |
|---|---|
| `npm run db:generate` | Create migration files from schema changes |
| `npm run db:migrate` | Apply pending migrations |
| `npm run db:push` | Push schema directly (dev only, no migration file) |
| `npm run db:studio` | Launch Drizzle Studio for visual browsing |

The SQLite database file lives at `./data/lumenforge.db`.

### Turso / libSQL (future)

Update `DATABASE_URL` in `.env` to your Turso URL and swap the driver in `lib/db.ts`.

## Project Structure

```
├── app/
│   ├── (auth)/              # Clerk sign-in/sign-up pages
│   ├── dashboard/           # Protected workspace
│   │   ├── layout.tsx       # Sidebar wrapper
│   │   ├── page.tsx         # Main dashboard (stats, projects, activity)
│   │   ├── clients/         # Client management
│   │   ├── projects/        # Project tracking
│   │   ├── invoices/        # Invoicing
│   │   └── tasks/           # Task management
│   ├── settings/            # Account settings
│   ├── globals.css          # Tailwind + indigo theme
│   ├── layout.tsx           # Root: ClerkProvider + ThemeProvider + Toaster
│   └── page.tsx             # Landing page
├── components/
│   ├── ui/                  # shadcn/ui (button, card, dialog, badge, etc.)
│   ├── dashboard/           # Sidebar component
│   └── theme-provider.tsx
├── db/
│   ├── schema.ts            # Drizzle: users, clients, projects, invoices, tasks, activity_logs
│   └── migrations/          # Auto-generated SQL migrations
├── lib/
│   ├── db.ts                # Database connection (server-only)
│   ├── utils.ts             # cn() helper
│   └── validation.ts        # Zod schemas for all entities
├── server/actions/          # Server Actions (client, project, invoice, task, activity)
├── types/index.ts           # TypeScript type definitions
├── middleware.ts             # Clerk auth + rate limiting
├── next.config.ts            # Security headers (CSP, HSTS, etc.)
└── drizzle.config.ts         # Drizzle Kit configuration
```

## Auth

Clerk handles all authentication. Configure your keys in `.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Protected routes: `/dashboard/*`, `/settings`, `/admin/*`, `/api/me`.

## Security

- **CSP headers** in `next.config.ts`
- **Rate limiting** in `middleware.ts` (60 req/min per IP)
- **Parameterized queries** via Drizzle ORM
- **Input validation** with Zod on all server actions
- **Ownership checks** on every mutation

```bash
npm audit
```

## License

MIT
