"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatInitials } from "@/lib/format";

/**
 * Clerk's <UserButton /> ships its own popover styling that can't be themed to
 * match, so the account menu is ours: same actions, same design system.
 */
export function AccountMenu({ collapsed = false }: { collapsed?: boolean }) {
  const { user, isLoaded } = useUser();
  const clerk = useClerk();

  const name = user?.fullName ?? user?.username ?? "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-md p-1.5 text-left transition-colors hover:bg-surface-raised/60"
        aria-label="Account menu"
      >
        <Avatar>
          {user?.imageUrl ? <AvatarImage src={user.imageUrl} alt="" /> : null}
          <AvatarFallback>
            {isLoaded ? formatInitials(name) : ""}
          </AvatarFallback>
        </Avatar>
        {collapsed ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{name}</span>
              {email ? (
                <span className="block truncate text-[11px] text-muted-foreground">
                  {email}
                </span>
              ) : null}
            </span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-muted-foreground" />
          </>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" side="top" className="w-60">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {email || name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Account settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => clerk.openUserProfile()}>
          <UserRound />
          Manage profile
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          tone="danger"
          onSelect={() => clerk.signOut({ redirectUrl: "/" })}
        >
          <LogOut />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
