import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full shrink-0" />
        ))}
      </div>

      <div className="grid gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 p-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 shrink-0" />
            <Skeleton className="h-5 w-20 shrink-0" />
            <Skeleton className="h-6 w-24 rounded-full shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
