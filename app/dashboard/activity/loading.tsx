import { PageShell } from "@/components/app/page-shell";
import { HeaderSkeleton } from "@/components/app/route-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ActivityLoading() {
  return (
    <PageShell width="narrow">
      <HeaderSkeleton withAction={false} />
      <Skeleton className="mb-6 h-8 w-96 rounded-md" />
      <div className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <div className="space-y-1 rounded-lg border border-border bg-card p-1.5">
              {Array.from({ length: 4 }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex items-center gap-2.5 px-2 py-2.5">
                  <Skeleton className="size-6 shrink-0 rounded-sm" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
