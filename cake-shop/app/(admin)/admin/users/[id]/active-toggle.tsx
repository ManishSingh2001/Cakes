"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UserActiveToggleProps {
  userId: string;
  isActive: boolean;
}

export function UserActiveToggle({ userId, isActive }: UserActiveToggleProps) {
  const router = useRouter();
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: checked }),
      });
      if (!res.ok) throw new Error();
      setActive(!!checked);
      toast.success(`User ${checked ? "activated" : "deactivated"}`);
      router.refresh();
    } catch {
      toast.error("Failed to update user status");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Switch
        checked={active}
        onCheckedChange={handleToggle}
        disabled={saving}
      />
      <Label>{active ? "Active" : "Inactive"}</Label>
    </div>
  );
}
