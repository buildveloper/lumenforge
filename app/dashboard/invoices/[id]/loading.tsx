import { PageShell } from "@/components/app/page-shell";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoiceDetailLoading() {
  return (
    <PageShell width="narrow">
      <Skeleton className="h-4 w-48" />
      <div className="mt-4 flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-9 w-56" />
      </div>
      <Skeleton className="mt-6 h-56 w-full rounded-lg" />
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
    </PageShell>
  );
}
