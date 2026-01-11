"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";
import { updateProfile } from "@/app/actions/update-profile";
import { Loader2 } from "lucide-react";

interface AccountSettingsFormProps {
  user: User | null;
}

const initialState = {
  success: false,
  message: undefined,
  errors: undefined,
};

export function AccountSettingsForm({ user }: AccountSettingsFormProps) {
  const [state, action, isPending] = useActionState(updateProfile, initialState);

  return (
    <form action={action} className="pt-4 border-t space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          defaultValue={user?.name || ""}
          placeholder="Enter your name"
          disabled={isPending}
        />
        {state.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          defaultValue={user?.email || ""}
          placeholder="Enter your email"
          disabled={isPending}
        />
        {state.errors?.email && (
          <p className="text-sm text-destructive">{state.errors.email[0]}</p>
        )}
        <p className="text-xs text-muted-foreground">
          If you change your email, please use the new address for future logins.
        </p>
      </div>

      {state.message && (
        <div
          className={`p-3 rounded-md text-sm ${
            state.success
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-destructive/10 text-destructive border border-destructive/20"
          }`}
        >
          {state.message}
        </div>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}










