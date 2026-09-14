import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/app/page-shell";
import { Button } from "@/components/ui/button";
import { ActivityView } from "@/components/dashboard/activity-view";
import { getRecentActivity } from "@/server/actions/activity";
import { getUnreadCount } from "@/server/actions/notification";
import { getProfile } from "@/server/actions/user";

export default async function ActivityPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  if (profile.role === "user") return null;

  const [activity, unread] = await Promise.all([
    getRecentActivity(60),
    getUnreadCount(),
  ]);

  return (
    <PageShell width="narrow">
      <PageHeader
        title="Activity"
        description={
          profile.role === "client"
            ? "Everything that has happened on your projects."
            : "Every change in your workspace, newest first."
        }
        actions={
          unread > 0 ? (
            <Button variant="outline" size="sm" className="gap-2" asChild>
              <Link href="/dashboard/activity">
                {unread} unread notification{unread === 1 ? "" : "s"}
              </Link>
            </Button>
          ) : null
        }
      />
      <ActivityView items={activity} />
    </PageShell>
  );
}
