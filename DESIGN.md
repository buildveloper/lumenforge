# LumenForge Design System

The source of truth for how this product looks, moves, and speaks. If code and
this document disagree, one of them is a bug.

---

## 1. What this product is, and who it is for

**LumenForge** is a workspace for independent professionals running client
engagements. A freelancer keeps clients, projects, tasks, and invoices in one
place, and their client gets a portal login instead of another status email.

**Register.** The authenticated app is a *product* surface: the interface is an
instrument, and it earns trust through consistency and speed. The marketing
site is a *brand* surface: the interface is the experience, and it has to make
someone want an account. They share tokens and components; they do not share
composition rules.

**The buyer** is a freelancer or small studio charging enough per engagement
that a lost invoice or a forgotten deadline is expensive. The second audience is
their client, who wants visibility without a learning curve.

---

## 2. The lane we chose, and why

The previous build was indigo `#6366f1` on blue-black `#0a0a10`, with blurred
gradient blobs and `rounded-xl` on every surface. That combination is the
generic AI-SaaS signature, and the hero never showed the product.

The lane is **"ledger"**: the visual language of a financial instrument and an
engineering drawing, not a billboard. Precision, tabular figures, hairline
rules, quiet warm surfaces, and one strong signal colour. Reference points for
principle, never for imitation: Stripe for how money is presented, Linear for
density and keyboard-first operation, Mercury for calm on a financial
dashboard, Attio for records that feel like a database rather than a form.

Every choice below follows from that, and each one has a reason.

---

## 3. Colour

Brand hue is **brass** (`oklch` hue 78) on a **warm charcoal** base. Not
blue-black: a whisper of warmth in the neutrals is what stops the whole thing
reading as another dark-mode dashboard.

### The one rule that matters

> **Brass is a signal, never a button fill.**

Primary buttons are high-contrast ink. Brass appears only as focus rings, the
active-nav indicator, the brand mark, status dots, the highlighted menu row, and
one hero CTA. That keeps brass under 10% of surface area, and it means brass can
never be confused with a warning state — which is why `--warning` does not exist
as a separate hue.

**"Brass marks where you are."** Focus, active navigation, the highlighted row,
and one CTA. That is the whole list.

### Roles

| Token | Dark | Light | Used for |
|---|---|---|---|
| `--background` | `oklch(0.148 0.005 75)` | `oklch(0.985 0.004 85)` | Canvas |
| `--card` | `oklch(0.182 0.006 75)` | `oklch(1 0 0)` | Surface 1 |
| `--popover` | `oklch(0.215 0.007 75)` | `oklch(1 0 0)` | Surface 2, overlays |
| `--surface-raised` | `oklch(0.245 0.008 75)` | `oklch(0.972 0.005 85)` | Surface 3, hover |
| `--surface-sunken` | `oklch(0.125 0.005 75)` | `oklch(0.962 0.006 85)` | Wells, code, empty states |
| `--foreground` | `oklch(0.955 0.004 85)` | `oklch(0.205 0.008 75)` | Text. Never pure white. |
| `--muted-foreground` | `oklch(0.680 0.008 80)` | `oklch(0.505 0.010 78)` | Secondary text |
| `--border` | `oklch(0.300 0.008 75)` | `oklch(0.905 0.006 80)` | The hairline |
| `--signal` | `oklch(0.800 0.125 78)` | `oklch(0.560 0.130 72)` | Brass |
| `--positive` | `oklch(0.720 0.135 155)` | `oklch(0.520 0.130 155)` | Paid, done |
| `--negative` | `oklch(0.640 0.190 25)` | `oklch(0.540 0.190 27)` | Overdue, destructive |

Four families only: **warm neutrals, brass, green, red.** Nothing else gets a
hue.

### Colour is never the only carrier of meaning

Every status renders a **glyph + label + tone** triple:

| Tone | Glyph | Statuses |
|---|---|---|
| neutral | hollow square | `draft`, `todo`, `cancelled` |
| signal | filled dot | `sent`, `in_progress`, `review`, `on_hold` |
| positive | drawn check | `paid`, `done`, `completed` |
| negative | alert stroke | `overdue` |

This survives greyscale printing, a screenshot, and all three colourblind
simulations. The single source is `lib/status.ts`; there is exactly one
`StatusChip` component and no local copies anywhere.

---

## 4. Typography

| Role | Face | Size / line | Rule |
|---|---|---|---|
| Display | **Instrument Serif** | 30–58px | Marketing only, 30px and up. Never in the app. |
| H1 | Geist 600 | 20–24px, −0.02em | |
| H2 | Geist 600 | 18/24 | |
| H3 | Geist 600 | 15/20 | |
| Body | Geist 400 | 14/22 app, 15–16/26 marketing | |
| Small | Geist 400 | 13/18 | |
| Label | Geist 500 | 12/16 | Sentence case |
| **Data** | **Geist Mono** | 12–15/16, `tabular-nums` | Money, IDs, dates |

### The three typographic rules

1. **Mono is for figures and identifiers only.** Invoice numbers, amounts,
   dates, counts, shortcut hints. Never body copy, never headings. This is the
   product's signature texture: `INV-2026-004` and `$4,800.00` line up in a
   column and read as data rather than prose. Use the `num` utility or `<Num>`.
2. **Uppercase + letter-spacing appears in exactly one place:** table column
   headers, via the `col-head` utility. Everywhere else that treatment reads as
   filler.
3. **Hierarchy at the small end comes from weight and colour, not scale.** 15px
   against 13px is a 1.15 ratio and that is honest for dense UI; what separates
   a heading from body text at that size is 600 weight and full-contrast colour.
   Scale does real work above 18px.

`text-wrap: balance` on headings, `pretty` on paragraphs.

---

## 5. Geometry, depth, and space

```
--radius-sm   3px   chips, badges
--radius-md   5px   buttons, inputs, selects, tabs
--radius-lg   7px   cards, tables, panels
--radius-xl  10px   dialogs, popovers, command palette
circular            avatars and dot indicators only
```

Most radius tokens were reduced from 12px. Near-square geometry is what makes
this read as an instrument.

**Depth is a lightness step, not a shadow.** `--card` → `--popover` →
`--surface-raised`, each a small lightness delta, always paired with a real
hairline border at full opacity. Shadows exist only for genuinely floating
things: `--shadow-popover` for menus and popovers, `--shadow-overlay` for
dialogs and the command palette. **No card in this product has a drop shadow.**
The old `hover:shadow-md` on every card was decoration on a dark background,
where shadows are nearly invisible anyway.

**Spacing** is a 4px base: 4/8/12/16/24/32/48/64/96. App density is 12–16px
gaps with 16–20px card padding and 48px rows. Marketing rhythm is 80–112px.

---

## 6. Motion

```
--dur-instant   80ms    --dur-fast  140ms
--dur-base     200ms    --dur-slow  320ms
--ease-out-expo        cubic-bezier(0.16, 1, 0.3, 1)
--ease-in-out-quart    cubic-bezier(0.65, 0, 0.35, 1)
springs: crisp {400, 32} · panel {260, 26} · brand {170, 22}
```

Animate `transform` and `opacity`. Exits run at roughly 70% of entrance
duration. Springs for direct manipulation, durations for entrances.

### The signature motions

Nothing else animates. This list is the whole system.

1. **Route settle** — content fades in and rises 6px on navigation, 180ms.
2. **Nav indicator glide** — the rail and tab-bar active pill travel via
   `layoutId` rather than a background swapping on and off.
3. **Menu and overlay entrances** — origin-aware popovers via Radix's
   `--radix-popper-transform-origin`; dialogs are a bottom sheet under 640px
   and a centred panel above it.
4. **Invoice paid** — the spinner resolves into a drawn check
   (`pathLength` 0→1, 300ms) instead of snapping.
5. **Kanban drag** — lift with a 2° tilt and overlay shadow, spring drop with a
   180ms easing.
6. **Marketing reveals** — sections fade and rise 12px as they enter, `once:
   true`, staggered by index.
7. **Accordion** — Radix measures content height and exposes it, so the reveal
   animates to an exact value rather than a guessed `max-height`.

**Reduced motion.** A `@media (prefers-reduced-motion: reduce)` block collapses
every duration token to 1ms and caps animation iteration, and
`<MotionConfig reducedMotion="user">` makes the motion library obey it too. No
component needs to know about it.

**Bundle discipline.** `LazyMotion` with `domMax` inside the authenticated app
(needed for `layoutId`) and `domAnimation` on the marketing surface, which sits
on the LCP route.

---

## 7. The nine states

Every component is designed in all nine. A layout that only works in the idle
state is a sketch.

| State | How it is handled |
|---|---|
| Idle | Default |
| Hover | `--surface-raised` background or a stronger border. Never a shadow. |
| Active | Slightly reduced opacity on press |
| Focused | Global `:focus-visible` — 2px brass outline, 2px offset |
| Loading | Skeletons sized like their real content, plus text that names the work |
| Empty | `EmptyState`: what belongs here, why it matters, one action to fill it |
| Error | `ErrorState`: what broke, that nothing was lost, a way back, a reference |
| Disabled | 45% opacity, pointer events off. Never used to hide a fixable problem. |
| Overflow | Truncation with `min-w-0`, horizontal scroll on tables and boards |

**Submit buttons are never disabled while a form is merely invalid.** A disabled
submit hides the thing that needs fixing. Submitting an invalid form surfaces a
field-level error instead.

---

## 8. Component rules

**Use the primitives.** `PageShell`, `PageHeader`, `StatTile`, `StatusChip`,
`Num`, `EmptyState`, `ErrorState`, `Field`, `Segmented`, `FilterLinks`,
`ActivityFeed`, `Table`, `withUndo`. If a surface needs something these do not
cover, extend the primitive rather than making a local variant.

- **Labels are never placeholders.** `Field` wires label, hint, and error with
  `htmlFor` / `aria-describedby` and renders the error under the control.
- **One dialog component per record type**, handling both create and edit.
  Project, client, invoice, and task each have exactly one.
- **Form state lives inside `DialogContent`**, which Radix unmounts on close, so
  fields reset on reopen without an effect that copies props into state.
- **Deletes are undoable, not confirmed.** Dismissing with `withUndo` shows a
  toast with an Undo action for 8 seconds. Dialogs that ask "are you sure?" about
  a decision already made are worse than a way back.
- **Toasts carry the work's name.** `${invoiceNumber} created`, not "Success".
- **Every chart ships a mechanism for reading it without seeing it** — an
  `aria-label` summary and a visually-hidden `<table>` equivalent. Charts are
  hand-rolled SVG; there is no charting library.
- **Filters are URLs, not client state**, when the list is server-rendered.
  Shareable, and they work with JavaScript off.

---

## 9. Accessibility floor

Not a checklist run at the end. The ground everything stands on.

- **Native first.** `<button>` for actions, `<a href>` for navigation, never a
  `<div onClick>`. No ARIA is better than wrong ARIA.
- **Every flow completes with the keyboard alone**, twice: once tabbing, once as
  a screen reader. Kanban drag has a `KeyboardSensor` with spoken announcements
  for pick-up, move, drop, and cancel.
- **Icon-only controls carry an `aria-label`.** The bell announces its unread
  count; row menus name their row.
- **Modals trap and restore focus**; the role picker is a set of real buttons.
- **Colour is never the only signal** (see §3).
- **Touch targets are 44px.** `[@media(pointer:coarse)]:min-h-11` grows the hit
  area without inflating the visual size on desktop.
- **It survives 200% zoom and 320px width.** Inputs are 16px under 640px so iOS
  Safari does not zoom the viewport on focus.
- **`aria-current="page"`** on navigation and the last breadcrumb.

---

## 10. Marketing rules

The landing page is a sales machine, not a portfolio. One primary action:
**Start free**. Everything else is demoted to a ghost link.

1. **Show the product in the hero.** The artifact is composed from the app's own
   components and tokens, so it cannot drift from the product and ships as
   static markup with no client JavaScript.
2. **The H1 must fail the swap test.** "Could another company use this exact
   headline with the same meaning?" If yes, rewrite it.
3. **One primary CTA**, plus one ghost. Never three buttons of equal weight.
4. **Sections earn their place.** There are ten: hero, workflow, differentiators,
   portal, security, pricing, FAQ, sample quotes, final CTA, footer. A uniform
   grid of six icon-and-paragraph feature cards is not one of them.
5. **Proof must be true.** No invented logos, no borrowed customer counts, no
   decorative star ratings. Testimonials are placeholders driven by a `sample`
   flag in `content/site.ts`, and the page renders a visible marker while that
   flag is set. Delete the flag when real quotes arrive.
6. **Say what is missing.** The pricing card states plainly that payment
   collection and PDF export are not built. An unqualified claim costs more
   trust than it buys.
7. **Long sections get the cliffhanger treatment** — leave part of the next
   section visible rather than ending on a clean boundary.
8. **One decorative element, with a reason.** A single radial brass glow behind
   the hero artifact ties to the product's name and directs the eye at the
   product instead of hiding it. Implemented as a pre-composed gradient, not a
   blurred layer, because a `blur(80px)` div is expensive.

---

## 11. Anti-patterns

Do not reintroduce any of these.

- **Indigo or blue-violet on blue-black.** The palette of every other tool.
- **Blurred gradient blobs**, glow rings, gradient text, particle effects.
- **Glassmorphism.** Frosted panels over a dashboard reduce legibility.
- **`rounded-xl` on every surface.** Depth comes from lightness steps.
- **Drop shadows on cards.** They are invisible on dark and decorative at best.
- **Pills for everything.** Status is a crisp rectangle, not a capsule.
- **Uppercase micro-headings everywhere.** Table headers only.
- **Icon-in-a-circle above a centred heading above two lines of grey text**, i.e.
  the six-card feature grid.
- **Fake interface animation.** The AI response used to be a finished string
  sliced every 10ms; it is now a real token stream.
- **Dead controls.** Anything disabled with no path to enablement, any link to a
  route that does not exist, any "coming soon" placeholder. All were removed.
- **Duplicated primitives.** There were six `StatusBadge` implementations and
  seven copies of the currency formatter. There is now one of each.
- **Merging unrelated concepts into one feed.** Activity is the audit trail;
  notifications are "this needs you". Merging them showed the same event twice.
- **Animating layout properties.** `box-shadow`, `filter`, `width`, `height`.
- **Em dashes in product copy**, and exclamation points anywhere.
- **Filling space without a reason.** Every section must state its purpose.

---

## 12. Where things live

```
app/globals.css                  All tokens. Colour, radius, type, motion, prose.
app/(marketing)/                 Landing page — display serif scoped here only
app/(auth)/                      Sign in and sign up, with the brand panel
app/dashboard/                   The authenticated app
app/api/ai/stream/               Token streaming route handler
components/brand/                The Aperture mark
components/app/                  Shell and primitives: rail, top bar, palette,
                                 StatusChip, Num, StatTile, PageShell, Field,
                                 EmptyState, ErrorState, Segmented, withUndo
components/ui/                   shadcn primitives, retuned to the tokens
components/dashboard/            Record views and their one dialog each
components/kanban/               Board, column, card, task form
components/marketing/            Landing sections
components/charts/               Hand-rolled SVG, no charting library
content/site.ts                  Every marketing string, in one place
lib/format.ts                    Money, dates, deadlines. The only formatter.
lib/status.ts                    Status tones and activity labels. The only map.
server/helpers/session.ts        Request-scoped identity, deduped with React cache
```

---

## 13. Performance rules

- **No library for something small.** Charts, undo toasts, and the command
  palette's filter are hand-built. The one third-party component adopted is an
  animated-number primitive.
- **`LazyMotion` feature sets are split by route group** (see §6).
- **The display serif loads only on the marketing route group.**
- **Fonts are self-hosted by `next/font`**, which keeps the strict
  `font-src 'self'` content security policy valid with no exceptions.
- **Never `blur()` a large element.** Use a pre-composed radial gradient.
- **Server-first.** The hero artifact, the kanban cards, and every table row are
  server-rendered. Client components exist where there is interaction, not by
  default.
