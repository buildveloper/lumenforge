import { Num } from "@/components/app/num";
import { StatusChip } from "@/components/app/status-chip";

/**
 * The hero artifact: a real project screen, composed from the product's own
 * components and tokens rather than a screenshot or a mock-up. It cannot drift
 * from the app, and it ships as static markup with no client JavaScript.
 */

const TILES = [
  { label: "Progress", value: "6/14", hint: "43% complete" },
  { label: "Budget", value: "$12,400", hint: "Agreed scope" },
  { label: "Outstanding", value: "$4,800", hint: "1 invoice sent" },
  { label: "Deadline", value: "12 days", hint: "24 September" },
];

const COLUMNS = [
  {
    label: "To do",
    count: 3,
    cards: [
      { title: "Migrate the blog templates", meta: "High · 12 Sep", priority: "high" },
      { title: "Audit colour contrast", meta: "Medium", priority: "medium" },
    ],
  },
  {
    label: "In progress",
    count: 2,
    cards: [{ title: "Rebuild the pricing page", meta: "Alex · 15 Sep", priority: "medium" }],
  },
  {
    label: "Review",
    count: 1,
    cards: [{ title: "Homepage hero copy", meta: "Awaiting client", priority: "low" }],
  },
];

const RAIL: Record<string, string> = {
  high: "before:bg-negative",
  medium: "before:bg-signal",
  low: "before:bg-border-strong",
};

function MiniCard({
  title,
  meta,
  priority,
}: {
  title: string;
  meta: string;
  priority: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-md border border-border bg-card p-2.5 pl-3 before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:content-[''] ${RAIL[priority]}`}
    >
      <p className="text-[12px] font-medium leading-snug">{title}</p>
      <p className="mt-1 text-[11px] text-muted-foreground">{meta}</p>
    </div>
  );
}

export function ProductArtifact() {
  return (
    <div className="relative">
      {/* One decorative element with a reason: light behind the product, tying
          to the name. A pre-composed gradient, not a blurred layer. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-16 -top-24 bottom-0 -z-10"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 30%, var(--signal-subtle), transparent 72%)",
        }}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-overlay">
        <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="size-1.5 shrink-0 rounded-full bg-signal" />
            <span className="truncate text-[13px] font-medium">
              Website redesign
            </span>
            <StatusChip status="active" />
          </div>
          <span className="hidden shrink-0 text-[12px] text-muted-foreground sm:block">
            Northwind Studio
          </span>
        </div>

        <div className="grid grid-cols-2 divide-x divide-border border-b border-border sm:grid-cols-4">
          {TILES.map((tile) => (
            <div key={tile.label} className="flex flex-col gap-0.5 px-4 py-3">
              <span className="text-[10px] font-medium text-muted-foreground">
                {tile.label}
              </span>
              <Num className="text-[15px] font-semibold leading-5 tracking-[-0.01em]">
                {tile.value}
              </Num>
              <span className="text-[10px] text-muted-foreground">{tile.hint}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.label} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                {column.label}
                <Num className="text-[10px] text-muted-foreground">
                  {column.count}
                </Num>
              </div>
              <div className="flex flex-col gap-2">
                {column.cards.map((card) => (
                  <MiniCard key={card.title} {...card} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
