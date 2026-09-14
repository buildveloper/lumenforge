import { PageShell } from "@/components/app/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Route skeletons shaped like their real pages. The previous build's skeletons
 * omitted the page container, so they rendered wider than the content they
 * stood in for and the layout shifted on load.
 */

export function HeaderSkeleton({ withAction = true }: { withAction?: boolean }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {withAction ? <Skeleton className="h-9 w-32 shrink-0" /> : null}
    </div>
  );
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card py-3.5 pl-4 pr-4"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-6 w-24" />
          <Skeleton className="mt-1.5 h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-4 border-b border-border px-3 py-2.5">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex items-center gap-4 border-b border-border px-3 py-3.5 last:border-b-0"
        >
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={columnIndex}
              className={columnIndex === 0 ? "h-4 flex-[2]" : "h-4 flex-1"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-border bg-card px-4 py-4"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
          <Skeleton className="mt-3 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <StatsSkeleton />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <TableSkeleton rows={3} columns={3} />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <ListSkeleton rows={3} />
          </div>
        </div>
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-44 w-full rounded-lg" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-56 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export function BoardSkeleton() {
  return (
    <PageShell width="wide">
      <HeaderSkeleton />
      <StatsSkeleton />
      <Skeleton className="mt-6 h-9 w-80" />
      <div className="mt-6 flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, columnIndex) => (
          <div key={columnIndex} className="min-w-[264px] flex-1 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
