"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { markAllAsRead } from "@/server/actions/notification";
import { toast } from "sonner";

export function ActivityClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleMarkAll() {
    setLoading(true);
    try {
      await markAllAsRead();
      toast.success("All notifications marked as read");
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
      router.refresh();
    }
  }

  return (
    <Button variant="outline" size="sm" className="gap-2" onClick={handleMarkAll} disabled={loading}>
      <CheckCheck className="h-4 w-4" />
      Mark all read
    </Button>
  );
}
