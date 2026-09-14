import { PageShell } from "@/components/app/page-shell";
import { HeaderSkeleton, TableSkeleton } from "@/components/app/route-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <Skeleton className="mb-4 h-7 w-64 rounded-md" />
      <TableSkeleton rows={7} columns={5} />
    </PageShell>
  );
}
