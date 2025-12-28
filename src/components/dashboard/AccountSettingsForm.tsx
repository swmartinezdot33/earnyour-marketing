"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";

interface AccountSettingsFormProps {
  user: User | null;
}

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // For now, this is a placeholder for future email/name update functionality
  // Email updates typically require re-verification, so we'll keep it read-only for now

  return (
    <div className="pt-4 border-t">
      <p className="text-sm text-muted-foreground">
        Account information updates coming soon. Contact support if you need to change your email or name.
      </p>
    </div>
  );
}







