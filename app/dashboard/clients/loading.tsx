import { PageShell } from "@/components/app/page-shell";
import { HeaderSkeleton, TableSkeleton } from "@/components/app/route-skeletons";

export default function ClientsLoading() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <TableSkeleton rows={6} columns={5} />
    </PageShell>
  );
}
