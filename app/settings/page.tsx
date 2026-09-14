import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Logo } from "@/components/brand/logo";
import { AccountMenu } from "@/components/app/account-menu";
import { SettingsTabs } from "@/components/settings/settings-tabs";
import { Button } from "@/components/ui/button";
import {
  getNotificationPreferences,
  getProfile,
} from "@/server/actions/user";
import { getUserId } from "@/server/helpers/session";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  if (!(await getUserId())) redirect("/sign-in");

  const [profile, preferences] = await Promise.all([
    getProfile(),
    getNotificationPreferences(),
  ]);

  const name = profile.name ?? "Account";
  const email = profile.email ?? "";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[760px] items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/dashboard" className="rounded-sm">
            <Logo />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="size-3.5" />
                Back to workspace
              </Link>
            </Button>
            <AccountMenu name={name} email={email} collapsed />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[760px] flex-1 px-4 py-8 sm:px-6 lg:py-10">
        <h1 className="text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
          Settings
        </h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Your account, what you get told about, and your plan.
        </p>

        <div className="mt-8">
          <SettingsTabs
            data={{
              profile: {
                name: profile.name,
                email: profile.email,
                role: profile.role,
              },
              preferences,
            }}
          />
        </div>
      </main>
    </div>
  );
}
