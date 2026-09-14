"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { toast } from "sonner";

import { Field } from "@/components/app/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePassword, updateProfile } from "@/server/actions/auth";
import { updateNotificationPreferences, updateUserRole } from "@/server/actions/user";
import { cn } from "@/lib/utils";

export type SettingsData = {
  profile: { name: string | null; email: string | null; role: string };
  preferences: {
    notifyProjectUpdates: boolean;
    notifyTaskAssignments: boolean;
    notifyInvoiceStatus: boolean;
    notifyAiCompletion: boolean;
  };
};

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-border py-4 last:border-b-0">
      <div className="min-w-0">
        <Label className="text-[13px]">{title}</Label>
        <p className="mt-1 text-[12px] leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0 pt-0.5">{children}</div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div>
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
        {description ? (
          <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <Card>
        <CardContent className="px-4 py-0">{children}</CardContent>
      </Card>
    </section>
  );
}

const PASSWORD_MIN = 10;

/** A real form now that we own the record, instead of a link to a provider. */
function NameForm({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      setError("A name is required.");
      return;
    }

    setSaving(true);
    setError(undefined);
    const result = await updateProfile({ name });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    toast.success("Name updated");
    router.refresh();
  }

  return (
    <form
      onSubmit={save}
      className="flex flex-col gap-3 border-b border-border py-4 sm:flex-row sm:items-start"
    >
      <Field label="Display name" htmlFor="settings-name" error={error} className="flex-1">
        <Input
          id="settings-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "settings-name-error" : undefined}
        />
      </Field>
      <Button
        type="submit"
        variant="outline"
        disabled={saving || name === initialName}
        className="sm:mt-[26px]"
      >
        {saving ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();

    if (newPassword !== confirm) {
      setError("The new passwords don't match.");
      return;
    }

    setSaving(true);
    setError(undefined);
    const result = await changePassword({ currentPassword, newPassword });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
    toast.success("Password changed. Other devices were signed out.");
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-4 py-4">
      {error ? (
        <p
          role="alert"
          className="rounded-md border border-negative/40 bg-negative/5 px-3 py-2.5 text-[12px] leading-5 text-negative"
        >
          {error}
        </p>
      ) : null}

      <Field label="Current password" htmlFor="current-password">
        <Input
          id="current-password"
          type="password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
          autoComplete="current-password"
          maxLength={200}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="New password"
          htmlFor="new-password"
          hint={`At least ${PASSWORD_MIN} characters.`}
        >
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            autoComplete="new-password"
            maxLength={200}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirm-password">
          <Input
            id="confirm-password"
            type="password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            autoComplete="new-password"
            maxLength={200}
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="outline" disabled={saving}>
          {saving ? "Changing…" : "Change password"}
        </Button>
      </div>
    </form>
  );
}

const THEMES = [
  { value: "system", label: "System", icon: Monitor },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
];

export function SettingsTabs({ data }: { data: SettingsData }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState(data.preferences);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [rolePending, setRolePending] = useState(false);

  const isClient = data.profile.role === "client";

  async function savePreference(key: keyof SettingsData["preferences"], value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSavingPrefs(true);
    try {
      await updateNotificationPreferences(next);
    } catch {
      setPrefs(prefs);
      toast.error("Couldn't save that preference. It has been reverted.");
    } finally {
      setSavingPrefs(false);
    }
  }

  async function switchRole() {
    setRolePending(true);
    try {
      const result = await updateUserRole({ role: isClient ? "freelancer" : "client" });
      if (result.role === "client" && result.claimed > 0) {
        toast.success(
          `Switched to client. ${result.claimed} ${result.claimed === 1 ? "record" : "records"} matched your email.`
        );
      } else {
        toast.success(`You are now set up as a ${result.role}.`);
      }
      router.refresh();
    } catch {
      toast.error("Couldn't change your role. It is unchanged.");
    } finally {
      setRolePending(false);
    }
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList className="mb-8">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="plan">Plan</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="flex flex-col gap-8">
        <SectionCard
          title="Account"
          description="How you appear in the workspace."
        >
          <NameForm initialName={data.profile.name ?? ""} />
          <Row
            title="Email"
            description="Your sign-in address. It is also what links you to work addressed to you."
          >
            <span className="num text-[12px] text-muted-foreground">
              {data.profile.email}
            </span>
          </Row>
        </SectionCard>

        <SectionCard
          title="Role"
          description={
            isClient
              ? "You're set up as a client, so you see the projects and invoices shared with your email."
              : "You're set up as a freelancer, so you see the clients, projects, and invoices you own."
          }
        >
          <Row
            title={isClient ? "Client" : "Freelancer"}
            description={
              isClient
                ? "Switching back to freelancer restores your own projects. Nothing is deleted either way."
                : "Switching to client shows the portal view instead. Your projects and invoices are kept and return when you switch back."
            }
          >
            <Button
              variant="outline"
              size="sm"
              onClick={switchRole}
              disabled={rolePending}
            >
              {rolePending
                ? "Switching…"
                : isClient
                  ? "Switch to freelancer"
                  : "Switch to client"}
            </Button>
          </Row>
        </SectionCard>

        <SectionCard
          title="Appearance"
          description="Dark is the designed default. Light is a full peer, not an afterthought."
        >
          <div className="flex gap-1.5 py-4">
            {THEMES.map((option) => {
              const active = theme === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTheme(option.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-2 rounded-md border px-3 py-4 transition-colors",
                    active
                      ? "border-signal/40 bg-signal-subtle text-signal"
                      : "border-border text-muted-foreground hover:border-border-strong hover:text-foreground"
                  )}
                >
                  <option.icon className="size-4" />
                  <span className="text-[12px] font-medium">{option.label}</span>
                  {active ? <Check className="size-3" /> : null}
                </button>
              );
            })}
          </div>
        </SectionCard>
      </TabsContent>

      <TabsContent value="notifications">
        <SectionCard
          title="Notifications"
          description="These control the bell in the top bar. All of them are saved immediately."
        >
          <Row
            title="Project updates"
            description="When a client approves a project or asks for changes."
          >
            <Switch
              checked={prefs.notifyProjectUpdates}
              disabled={savingPrefs}
              onCheckedChange={(value) => savePreference("notifyProjectUpdates", value)}
              aria-label="Project updates"
            />
          </Row>
          <Row
            title="Task activity"
            description="When tasks are added or completed on a project you are part of."
          >
            <Switch
              checked={prefs.notifyTaskAssignments}
              disabled={savingPrefs}
              onCheckedChange={(value) => savePreference("notifyTaskAssignments", value)}
              aria-label="Task activity"
            />
          </Row>
          <Row
            title="Invoice status"
            description="When an invoice is raised or its status changes."
          >
            <Switch
              checked={prefs.notifyInvoiceStatus}
              disabled={savingPrefs}
              onCheckedChange={(value) => savePreference("notifyInvoiceStatus", value)}
              aria-label="Invoice status"
            />
          </Row>
          <Row
            title="AI completion"
            description="When a generation you started finishes. Off by default, since you are already watching it."
          >
            <Switch
              checked={prefs.notifyAiCompletion}
              disabled={savingPrefs}
              onCheckedChange={(value) => savePreference("notifyAiCompletion", value)}
              aria-label="AI completion"
            />
          </Row>
        </SectionCard>
      </TabsContent>

      <TabsContent value="security" className="flex flex-col gap-8">
        <SectionCard
          title="Password"
          description="Changing your password signs out every other device."
        >
          <PasswordForm />
        </SectionCard>

        <SectionCard
          title="Sessions"
          description="Sessions last 30 days and are stored server-side, so signing out invalidates them immediately rather than waiting for a cookie to expire."
        >
          <Row
            title="Password hashing"
            description="Passwords are hashed with scrypt and a per-account salt. The plaintext is never stored or logged."
          >
            <span className="text-[12px] text-muted-foreground">scrypt</span>
          </Row>
        </SectionCard>
      </TabsContent>

      <TabsContent value="plan">
        <SectionCard
          title="Plan"
          description="LumenForge is free, and every feature is in the free tier."
        >
          <div className="py-5">
            <p className="num text-[32px] font-semibold leading-none tracking-[-0.03em]">
              $0
            </p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              No card on file, no trial expiry, no feature gates.
            </p>

            <ul className="mt-5 flex flex-col gap-2">
              {[
                "Unlimited clients, projects, and tasks",
                "Invoices with your own numbering",
                "Client portal access",
                "AI drafting and progress summaries",
                "Full activity log",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-[13px]">
                  <span className="mt-1.5 size-1 shrink-0 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </SectionCard>
      </TabsContent>
    </Tabs>
  );
}
