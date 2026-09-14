"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import { CopyButton } from "@/components/app/copy-button";
import { EmptyState } from "@/components/app/empty-state";
import { Num } from "@/components/app/num";
import { withUndo } from "@/components/app/with-undo";
import {
  ClientFormDialog,
  type ClientFormValues,
} from "@/components/dashboard/client-form-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney, formatRelative } from "@/lib/format";
import { restoreClient, softDeleteClient } from "@/server/actions/client";
import { cn } from "@/lib/utils";

export type ClientRecord = ClientFormValues & {
  clientUserId: string | null;
  claimedAt: string | null;
  updatedAt: string;
  openProjects: number;
  totalProjects: number;
  outstanding: number;
  lastActivityAt: string;
};

export function NewClientButton({
  initialOpen = false,
  label = "New client",
}: {
  initialOpen?: boolean;
  label?: string;
}) {
  const [open, setOpen] = useState(initialOpen);
  const router = useRouter();

  return (
    <>
      <Button className="gap-2" onClick={() => setOpen(true)}>
        <Plus className="size-4" />
        {label}
      </Button>
      <ClientFormDialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            if (initialOpen) router.replace("/dashboard/clients");
            router.refresh();
          }
        }}
      />
    </>
  );
}

function portalState(client: ClientRecord) {
  if (client.clientUserId) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] text-positive">
        <span className="size-1.5 rounded-full bg-current" />
        Linked
      </span>
    );
  }
  if (!client.email) {
    return <span className="text-[11px] text-muted-foreground">No email on file</span>;
  }
  return (
    <span className="text-[11px] text-muted-foreground">
      Hasn&rsquo;t signed up yet
    </span>
  );
}

export function ClientsTable({ clients }: { clients: ClientRecord[] }) {
  const [editing, setEditing] = useState<ClientRecord | null>(null);
  const router = useRouter();

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Users}
        title="No clients yet"
        description="Add the people you work for. The email address is what lets them claim portal access and see their own projects and invoices."
        action={<NewClientButton label="Add your first client" />}
      />
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[26%]">Client</TableHead>
              <TableHead className="w-[24%]">Contact</TableHead>
              <TableHead className="hidden w-[12%] md:table-cell">Projects</TableHead>
              <TableHead className="hidden w-[14%] md:table-cell">Portal</TableHead>
              <TableHead className="w-[16%] text-right">Outstanding</TableHead>
              <TableHead className="w-[8%]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <div className="flex min-w-0 items-center gap-2.5">
                    <span className="grid size-7 shrink-0 place-items-center rounded-sm border border-border bg-surface-sunken text-[11px] font-medium text-muted-foreground">
                      {client.name.slice(0, 1).toUpperCase()}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-medium">
                        {client.name}
                      </span>
                      <span className="block truncate text-[12px] text-muted-foreground">
                        {client.company ?? client.email ?? "—"}
                      </span>
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {client.email ? (
                    <span className="flex min-w-0 items-center gap-1">
                      <span className="truncate text-[12px] text-muted-foreground">
                        {client.email}
                      </span>
                      <CopyButton value={client.email} className="size-6 shrink-0" />
                    </span>
                  ) : (
                    <span className="text-[12px] text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {client.totalProjects === 0 ? (
                    <span className="text-[12px] text-muted-foreground">None</span>
                  ) : (
                    <span className="text-[12px]">
                      <Num>{client.openProjects}</Num>
                      <span className="text-muted-foreground">
                        {" "}
                        open / {client.totalProjects}
                      </span>
                    </span>
                  )}
                </TableCell>

                <TableCell className="hidden md:table-cell">
                  {portalState(client)}
                </TableCell>

                <TableCell className="text-right">
                  <Num
                    className={cn(
                      "block text-[13px]",
                      client.outstanding > 0
                        ? "text-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    {formatMoney(client.outstanding)}
                  </Num>
                  <span className="block text-[11px] text-muted-foreground">
                    {formatRelative(client.lastActivityAt)}
                  </span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
                    {client.totalProjects > 0 ? (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Projects for ${client.name}`}
                        asChild
                      >
                        <Link href={`/dashboard/projects?client=${client.id}`}>
                          <ExternalLink className="size-3.5" />
                        </Link>
                      </Button>
                    ) : null}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${client.name}`}
                          className="text-muted-foreground"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(client)}>
                          <Pencil />
                          Edit details
                        </DropdownMenuItem>
                        {client.email ? (
                          <DropdownMenuItem asChild>
                            <a href={`mailto:${client.email}`}>
                              <Mail />
                              Email
                            </a>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          tone="danger"
                          onSelect={() => {
                            void withUndo({
                              message: `${client.name} removed`,
                              remove: () =>
                                softDeleteClient({ clientId: client.id }),
                              undo: () => restoreClient({ clientId: client.id }),
                              restoredMessage: `${client.name} restored`,
                            }).then((ok) => {
                              if (ok) router.refresh();
                            });
                          }}
                        >
                          <Trash2 />
                          Remove client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClientFormDialog
        open={editing !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditing(null);
            router.refresh();
          }
        }}
        client={editing ?? undefined}
      />
    </>
  );
}
