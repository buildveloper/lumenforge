"use client";

import { useState } from "react";
import { ChevronsUpDown, LogOut, Settings } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatInitials } from "@/lib/format";
import { signOut } from "@/server/actions/auth";

export function AccountMenu({
  name,
  email,
  collapsed = false,
}: {
  name: string;
  email: string;
  collapsed?: boolean;
}) {
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await signOut();
    // A hard navigation, so every cached render is discarded along with the
    // session rather than being reused with stale privileged data in it.
    window.location.assign("/");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-surface-raised/60"
        aria-label="Account menu"
      >
        <Avatar>
          <AvatarFallback>{formatInitials(name)}</AvatarFallback>
        </Avatar>
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{name}</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                {email}
              </span>
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-60">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          tone="danger"
          disabled={pending}
          onSelect={() => {
            void handleSignOut();
          }}
        >
          <LogOut />
          {pending ? "Signing out…" : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
