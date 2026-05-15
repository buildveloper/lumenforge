import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Bell, Briefcase, CreditCard, User } from "lucide-react";
import { SettingsProfile } from "./settings-profile";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const user = clerkUser
    ? {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        emailAddresses: clerkUser.emailAddresses.map((e) => ({
          emailAddress: e.emailAddress,
        })),
        imageUrl: clerkUser.imageUrl,
      }
    : null;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold tracking-tight">LumenForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight mb-8">Settings</h1>

          <Tabs defaultValue="profile">
            <TabsList className="w-full justify-start border-b border-border/40 rounded-none bg-transparent h-auto p-0 mb-8">
              <TabTrigger value="profile" label="Profile" icon={User} />
              <TabTrigger value="security" label="Security" icon={Shield} />
              <TabTrigger value="notifications" label="Notifications" icon={Bell} />
              <TabTrigger value="billing" label="Billing" icon={CreditCard} />
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <SettingsProfile user={user} />
            </TabsContent>

            <TabsContent value="security" className="mt-0">
              <div className="space-y-6">
                <Card className="border-border/40 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Account Security</CardTitle>
                    <CardDescription>
                      Manage your password, MFA, and active sessions through your Clerk account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" asChild>
                      <a href="https://accounts.clerk.com/user" target="_blank" rel="noopener">
                        Open Clerk Settings
                      </a>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-border/40 bg-card/50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Key className="h-5 w-5 text-primary" /> API Keys
                    </CardTitle>
                    <CardDescription>
                      Generate and manage API keys for programmatic access.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" disabled>Coming Soon</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="mt-0">
              <Card className="border-border/40 bg-card/50">
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose which notifications you want to receive.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    "Project updates",
                    "Task assignments",
                    "Invoice status changes",
                    "AI generation completed",
                  ].map((item) => (
                    <div key={item} className="flex items-center justify-between py-2">
                      <span className="text-sm text-muted-foreground">{item}</span>
                      <div className="h-5 w-9 rounded-full bg-muted relative cursor-not-allowed opacity-50">
                        <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-muted-foreground/40" />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-muted-foreground pt-2">
                    Notification preferences coming soon. All notifications are currently enabled.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <Card className="border-dashed border-border/60 bg-muted/20">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CreditCard className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-1">Billing coming soon</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscription management and billing history will be available with Stripe integration.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function TabTrigger({ value, label, icon: Icon }: { value: string; label: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <TabsTrigger
      value={value}
      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3 text-sm font-medium text-muted-foreground data-[state=active]:text-foreground transition-colors flex items-center gap-2"
    >
      <Icon className="h-4 w-4" />
      {label}
    </TabsTrigger>
  );
}
