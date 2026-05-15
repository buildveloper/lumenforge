import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-32 shrink-0" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-3">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="rounded-xl border border-border/40 bg-card/50 p-6 space-y-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
