"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

interface PaymentUpdaterProps {
  orderId: string;
  method: string;
  currentStatus: string;
}

export function PaymentUpdater({
  orderId,
  method,
  currentStatus,
}: PaymentUpdaterProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const updatePayment = async (newStatus: "paid" | "failed" | "refunded") => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/orders/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(`Payment marked as ${newStatus}`);
      router.refresh();
    } catch {
      toast.error("Failed to update payment status");
    } finally {
      setSaving(false);
    }
  };

  const isPending = currentStatus === "pending";
  const isPaid = currentStatus === "paid";
  const showActions = (method === "cod" || method === "bank_transfer") && !isPaid;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Payment Status</span>
        <Badge
          variant="secondary"
          className={
            isPaid
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : currentStatus === "failed"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                : ""
          }
        >
          {currentStatus}
        </Badge>
      </div>

      {showActions && (
        <div className="flex gap-2 pt-1">
          {isPending && (
            <>
              <Button
                size="sm"
                onClick={() => updatePayment("paid")}
                disabled={saving}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {saving ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                )}
                Mark as Paid
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => updatePayment("failed")}
                disabled={saving}
              >
                <XCircle className="mr-1 h-3 w-3" />
                Failed
              </Button>
            </>
          )}
          {currentStatus === "failed" && (
            <Button
              size="sm"
              onClick={() => updatePayment("paid")}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {saving ? (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1 h-3 w-3" />
              )}
              Mark as Paid
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
