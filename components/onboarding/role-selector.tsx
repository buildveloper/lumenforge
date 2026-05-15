"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Users, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateUserRole } from "@/server/actions/user";
import { toast } from "sonner";

export function RoleSelector() {
  const router = useRouter();
  const [selecting, setSelecting] = useState(false);

  async function handleSelect(role: "freelancer" | "client") {
    setSelecting(true);
    try {
      await updateUserRole({ role });
      toast.success(
        role === "freelancer"
          ? "Welcome, freelancer!"
          : "Welcome! Let's get started."
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to set role"
      );
    } finally {
      setSelecting(false);
    }
  }

  return (
    <Dialog open modal>
      <DialogContent
        className="sm:max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">
            How will you use LumenForge?
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose your role to personalize your experience. You can change this
            later in settings.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-4 sm:grid-cols-2">
          <Card
            className="cursor-pointer border-border/40 bg-card/50 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]"
            onClick={() => !selecting && handleSelect("freelancer")}
          >
            <CardHeader className="text-center py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">I am a Freelancer</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                Manage projects, track invoices, and collaborate with clients
                from one place.
              </CardDescription>
              {selecting ? (
                <div className="mt-4 h-9 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Get Started <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
          </Card>

          <Card
            className="cursor-pointer border-border/40 bg-card/50 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:scale-[1.02]"
            onClick={() => !selecting && handleSelect("client")}
          >
            <CardHeader className="text-center py-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-4">
                <Users className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-lg">I am a Client</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                View project progress, approve deliverables, and manage invoices
                from your freelancer.
              </CardDescription>
              {selecting ? (
                <div className="mt-4 h-9 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Get Started <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
