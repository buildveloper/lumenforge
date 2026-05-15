# LumenForge - AI Agent Instructions

## Project Overview
LumenForge is a premium AI-enhanced Freelancer & Client Portal SaaS.  
It combines **Project Management, Client Portal, Invoicing, and AI assistance** into one beautiful, secure tool — built to impress clients for high-value ($40k+) freelance gigs.

**Core Purpose**: Help freelancers and small agencies manage clients, projects, invoices, and communications in one professional workspace, with AI features for proposals, summaries, and smart suggestions.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Clerk
- **Database**: Drizzle ORM + SQLite (better-sqlite3) → future Turso/libSQL
- **UI Library**: shadcn/ui components
- **AI**: Groq (primary) — ready for prompt generation, proposals, summaries
- **Deployment**: Vercel

## Design & UI Principles (Very Important)
- **Premium SaaS aesthetic** — Think Linear, Vercel, Stripe, Raycast.
- Generous whitespace, excellent typography (Geist/Inter), subtle shadows, clean cards.
- Default **dark mode** with deep zinc/slate base + indigo/blue accents.
- High-signal, minimal, professional — **no AI-slop, no excessive gradients or gimmicks**.
- Mobile-first and fully responsive.
- Always include loading states, empty states, success/error toasts.
- Use `sonner` for toasts.

## Security Rules (Non-Negotiable)
- Never trust the client. All authorization on server side.
- Always verify Clerk `currentUser` and ownership (`userId` checks).
- Use Zod for **all** input validation.
- Soft deletes everywhere (`deletedAt`).
- Parameterized queries only (Drizzle handles this).
- Rate limiting already in middleware — respect it.
- Never expose sensitive data to client components.
- Log critical actions in `activity_logs`.

## Folder Structure (Respect This)

app/                  → Routes & Server Components
components/           → Reusable UI
components/ui/        → shadcn components
components/dashboard/ → Dashboard-specific
db/schema.ts          → All Drizzle schemas
lib/db.ts             → Database connection
server/actions/       → All Server Actions
types/                → TypeScript definitions
hooks/                → Custom hooks


## Coding Guidelines
- Prefer **Server Components** and **Server Actions**.
- Keep components small and reusable.
- Use proper TypeScript — no `any`.
- Write clear, commented Server Actions.
- Always return `{ success: boolean, data?: any, error?: string }` from actions.
- Use `revalidatePath` or `revalidateTag` after mutations.
- Names: `createProject`, `getUserProjects`, `updateInvoice`, etc.

## Workflows (How Everything Should Connect)
For every major feature, ensure:
1. User clicks button → Form validation (Zod)
2. Server Action runs → Clerk auth + ownership check
3. Database operation (with soft delete logic)
4. Activity log entry
5. `revalidatePath("/dashboard")` or relevant path
6. Success toast + UI refresh

## Future Phases (Keep in Mind)
- Phase 1: Foundation + Beautiful Landing + Dashboard Skeleton
- Phase 2: User Roles + Projects
- Phase 3: Kanban / Tasks
- Phase 4: Client Portal Views
- Phase 5: Invoicing + Stripe
- Phase 6: AI Features (Groq)
- Phase 7: Notifications, Analytics, Polish

## AI Usage Rules
- When generating UI, make it feel expensive and professional.
- When building features, always include full workflow (button → action → DB → feedback).
- Suggest improvements for security and UX.
- Keep code clean and maintainable.

You are building a portfolio piece that should look and feel like a $40k+ production SaaS.

Now go build something excellent.