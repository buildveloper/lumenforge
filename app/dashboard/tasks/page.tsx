import { CheckSquare } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mx-auto mb-6">
        <CheckSquare className="h-8 w-8 text-primary" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Tasks</h1>
      <p className="text-muted-foreground max-w-sm mx-auto">
        Break projects into actionable tasks. Set priorities and deadlines.
      </p>
    </div>
  );
}
