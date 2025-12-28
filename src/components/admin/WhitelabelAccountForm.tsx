"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { WhitelabelAccount } from "@/lib/db/schema";

interface WhitelabelAccountFormProps {
  account: WhitelabelAccount;
}

export function WhitelabelAccountForm({ account }: WhitelabelAccountFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      ghlLocationId: formData.get("ghlLocationId") as string,
      ghlApiToken: formData.get("ghlApiToken") as string || undefined,
      branding: {
        logo: formData.get("logo") as string || undefined,
        primaryColor: formData.get("primaryColor") as string || undefined,
        secondaryColor: formData.get("secondaryColor") as string || undefined,
      },
      status: formData.get("status") as "active" | "suspended" | "pending",
    };

    try {
      const response = await fetch(`/api/admin/whitelabel/${account.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update whitelabel account");
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const branding = account.branding as {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
  } || {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Account Name</Label>
        <Input
          id="name"
          name="name"
          defaultValue={account.name}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ghlLocationId">GHL Location ID</Label>
        <Input
          id="ghlLocationId"
          name="ghlLocationId"
          defaultValue={account.ghl_location_id}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ghlApiToken">GHL API Token (PIT Token)</Label>
        <Textarea
          id="ghlApiToken"
          name="ghlApiToken"
          placeholder="Enter new token to update (leave blank to keep current)"
          rows={3}
        />
        <p className="text-sm text-muted-foreground">
          Only enter a new token if you want to update it. Current token is stored securely.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={account.status}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="space-y-4 border-t pt-4">
        <h3 className="font-semibold">Branding</h3>
        
        <div className="space-y-2">
          <Label htmlFor="logo">Logo URL</Label>
          <Input
            id="logo"
            name="logo"
            type="url"
            defaultValue={branding.logo}
            placeholder="https://example.com/logo.png"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <Input
              id="primaryColor"
              name="primaryColor"
              type="color"
              defaultValue={branding.primaryColor || "#FF6B35"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <Input
              id="secondaryColor"
              name="secondaryColor"
              type="color"
              defaultValue={branding.secondaryColor || "#004E89"}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-800 rounded-lg">
          Account updated successfully!
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}







