import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Users, Plus, Building2, Mail, Phone, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { getClients } from "@/server/actions/client";
import { getDashboardData } from "@/server/actions/user";

export default async function ClientsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { clients: clientList } = await getClients();
  const { role } = await getDashboardData();
  const isFreelancer = role === "freelancer";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your client list and contact details.
          </p>
        </div>
        {isFreelancer && (
          <Button size="sm" className="gap-2" disabled>
            <Plus className="h-4 w-4" />
            New Client
          </Button>
        )}
      </div>

      {clientList.length === 0 ? (
        <Card className="border-dashed border-border/60 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-5">
              <Users className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">No clients yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-6">
              {isFreelancer
                ? "Add your first client to start managing projects and invoices together."
                : "Your freelancer hasn&apos;t added any clients yet."}
            </p>
            {isFreelancer && (
              <Button variant="outline" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Add your first client
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {clientList.map((client) => (
            <Card
              key={client.id}
              className="border-border/40 bg-card/50 hover:bg-card/80 transition-colors"
            >
              <CardContent className="flex items-center gap-4 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{client.name}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                    {client.email && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {client.phone}
                      </span>
                    )}
                  </div>
                </div>
                {client.company && (
                  <Badge variant="secondary" className="text-xs shrink-0 hidden sm:inline-flex">
                    {client.company}
                  </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" disabled>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
