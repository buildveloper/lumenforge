"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CornerDownLeft, Plus, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { CREATE_ACTIONS, navItemsForRole } from "@/components/app/nav-config";
import { cn } from "@/lib/utils";

export type ProjectOption = { id: string; title: string };

/**
 * ⌘K is the fastest signal that this is an instrument rather than a form.
 * Navigation, creation, and project jumps all resolve without touching the mouse.
 */
export function CommandMenu({
  role,
  projects = [],
}: {
  role: string;
  projects?: ProjectOption[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const items = navItemsForRole(role);
  const canCreate = role !== "client";

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function run(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden h-8 items-center gap-2 rounded-md border border-border bg-card px-2.5 text-[12px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground sm:flex"
        )}
      >
        <Search className="size-3.5" />
        <span>Search</span>
        <kbd className="num ml-3 rounded-xs border border-border px-1 py-px text-[10px] leading-4">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-raised hover:text-foreground sm:hidden"
      >
        <Search className="size-4" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search or jump to…" />
        <CommandList>
          <CommandEmpty>Nothing matches that.</CommandEmpty>

          <CommandGroup heading="Go to">
            {items.map((item) => (
              <CommandItem
                key={item.href}
                value={`go ${item.label}`}
                onSelect={() => run(item.href)}
              >
                <item.icon className="text-muted-foreground" />
                {item.label}
              </CommandItem>
            ))}
          </CommandGroup>

          {canCreate ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Create">
                {CREATE_ACTIONS.map((action) => (
                  <CommandItem
                    key={action.href}
                    value={`create ${action.label}`}
                    onSelect={() => run(action.href)}
                  >
                    <Plus className="text-muted-foreground" />
                    {action.label}
                    <CommandShortcut>{action.description}</CommandShortcut>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}

          {projects.length > 0 ? (
            <>
              <CommandSeparator />
              <CommandGroup heading="Projects">
                {projects.map((project) => (
                  <CommandItem
                    key={project.id}
                    value={`project ${project.title}`}
                    onSelect={() => run(`/dashboard/projects/${project.id}`)}
                  >
                    <Briefcase className="text-muted-foreground" />
                    <span className="truncate">{project.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          ) : null}
        </CommandList>

        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CornerDownLeft className="size-3" />
            Open
          </span>
          <span>Esc to close</span>
        </div>
      </CommandDialog>
    </>
  );
}
