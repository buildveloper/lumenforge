import { getUserId } from "@/server/helpers/session";
import { redirect } from "next/navigation";

import { FilterLinks } from "@/components/app/filter-links";
import { Num } from "@/components/app/num";
import { PageHeader, PageShell } from "@/components/app/page-shell";
import {
  InvoicesTable,
  NewInvoiceButton,
} from "@/components/dashboard/invoices-view";
import { formatMoney } from "@/lib/format";
import { getClientOptions } from "@/server/actions/client";
import { getUserInvoices } from "@/server/actions/invoice";
import { getProjectOptions } from "@/server/actions/project";
import { getProfile } from "@/server/actions/user";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; new?: string }>;
}) {
  const userId = await getUserId();
  if (!userId) redirect("/sign-in");

  const profile = await getProfile();
  if (profile.role === "user") return null;

  const isClient = profile.role === "client";
  const params = await searchParams;

  const [data, clients, projects] = await Promise.all([
    getUserInvoices(params.status, { page: 1, limit: 50 }),
    isClient ? Promise.resolve([]) : getClientOptions(),
    isClient ? Promise.resolve([]) : getProjectOptions(),
  ]);

  const shownTotal = data.invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );
  const activeFilter = params.status ?? "all";

  return (
    <PageShell>
      <PageHeader
        title="Invoices"
        description={
          data.counts.all === 0
            ? "Raise an invoice and it is numbered from your own sequence."
            : `${data.counts.all} invoice${data.counts.all === 1 ? "" : "s"}${
                data.counts.overdue
                  ? ` Â· ${data.counts.overdue} overdue`
                  : ""
              }`
        }
        actions={
          isClient ? null : (
            <NewInvoiceButton
              initialOpen={params.new === "1"}
              clients={clients.map((client) => ({
                id: client.id,
                label: client.company
                  ? `${client.name} Â· ${client.company}`
                  : client.name,
              }))}
              projects={projects.map((project) => ({
                id: project.id,
                label: project.title,
              }))}
            />
          )
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterLinks
          basePath="/dashboard/invoices"
          current={activeFilter}
          options={[
            { value: "all", label: "All", count: data.counts.all },
            { value: "draft", label: "Draft", count: data.counts.draft },
            { value: "sent", label: "Sent", count: data.counts.sent },
            { value: "paid", label: "Paid", count: data.counts.paid },
            { value: "overdue", label: "Overdue", count: data.counts.overdue },
          ]}
        />

        {data.invoices.length > 0 ? (
          <Num className="shrink-0 text-[12px] text-muted-foreground">
            Showing {formatMoney(shownTotal, { decimals: true })}
          </Num>
        ) : null}
      </div>

      <InvoicesTable
        invoices={data.invoices}
        emptyDescription={
          activeFilter === "all"
            ? undefined
            : `Nothing is ${activeFilter} right now. That is the state you want for draft and overdue.`
        }
      />
    </PageShell>
  );
}
