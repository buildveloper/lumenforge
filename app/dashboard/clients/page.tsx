import { getUserId } from "@/server/helpers/session";
import { redirect } from "next/navigation";

import { PageHeader, PageShell } from "@/components/app/page-shell";
import {
  ClientsTable,
  NewClientButton,
} from "@/components/dashboard/clients-view";
import { getClientRecords } from "@/server/actions/client";
import { getProfile } from "@/server/actions/user";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ new?: string }>;
}) {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  // Clients don't have a client directory; the rail hides it, this guards the URL.
  if (profile.role === "client") redirect("/dashboard");
  if (profile.role === "user") return null;

  const [clients, params] = await Promise.all([
    getClientRecords(),
    searchParams,
  ]);

  const needsPortal = clients.filter((client) => client.email && !client.clientUserId).length;

  return (
    <PageShell>
      <PageHeader
        title="Clients"
        description={
          clients.length === 0
            ? "Everyone you do work for, with what they owe and what is in flight."
            : `${clients.length} client${clients.length === 1 ? "" : "s"}${
                needsPortal > 0
                  ? ` Â· ${needsPortal} yet to claim portal access`
                  : ""
              }`
        }
        actions={<NewClientButton initialOpen={params.new === "1"} />}
      />
      <ClientsTable clients={clients} />
    </PageShell>
  );
}
