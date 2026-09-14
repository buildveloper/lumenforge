import { PageShell } from "@/components/app/page-shell";
import { HeaderSkeleton, TableSkeleton } from "@/components/app/route-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <Skeleton className="mb-4 h-8 w-80 rounded-md" />
      <TableSkeleton rows={7} columns={4} />
    </PageShell>
  );
}
