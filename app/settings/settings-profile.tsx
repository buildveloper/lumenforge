"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { toast } from "sonner";

type SettingsProfileProps = {
  user: {
    firstName: string | null;
    lastName: string | null;
    emailAddresses: { emailAddress: string }[];
    imageUrl: string;
  } | null;
};

export function SettingsProfile({ user }: SettingsProfileProps) {
  const [saving, setSaving] = useState(false);

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile
          </CardTitle>
          <CardDescription>
            Your profile information is managed through Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Name</Label>
            <Input
              value={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "Not set"}
              disabled
              className="bg-muted/50"
            />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input
              value={user?.emailAddresses?.[0]?.emailAddress ?? "Not set"}
              disabled
              className="bg-muted/50"
            />
          </div>
          <Button variant="outline" asChild className="mt-2">
            <a href="https://accounts.clerk.com/user" target="_blank" rel="noopener">
              Edit Profile in Clerk
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
