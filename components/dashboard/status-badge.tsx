import { Badge } from "@/components/ui/badge";

const variants: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  draft: "outline",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "outline",
  active: "default",
  completed: "success",
  on_hold: "warning",
  todo: "outline",
  in_progress: "default",
  review: "warning",
  done: "success",
};

export function StatusBadge({ status }: { status: string }) {
  const badgeVariant = variants[status] ?? "secondary";
  return (
    <Badge variant={badgeVariant as "default"} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}
