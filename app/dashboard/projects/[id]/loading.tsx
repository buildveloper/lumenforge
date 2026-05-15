import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-32 shrink-0" />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card/50 p-4 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      <Skeleton className="h-10 w-72" />

      <div className="flex gap-6 overflow-x-auto pb-2">
        {Array.from({ length: 4 }).map((_, colIdx) => (
          <div key={colIdx} className="min-w-[280px] space-y-3">
            <Skeleton className="h-8 w-24" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
