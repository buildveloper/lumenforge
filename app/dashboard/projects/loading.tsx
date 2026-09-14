import { PageShell } from "@/components/app/page-shell";
import { HeaderSkeleton, ListSkeleton } from "@/components/app/route-skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsLoading() {
  return (
    <PageShell>
      <HeaderSkeleton withAction={false} />
      <Skeleton className="mb-4 h-8 w-72 rounded-md" />
      <ListSkeleton rows={5} />
    </PageShell>
  );
}
