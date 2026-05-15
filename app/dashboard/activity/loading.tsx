import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />

      <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full mt-0.5 shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-3 w-16 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
