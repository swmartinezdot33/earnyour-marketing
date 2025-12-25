"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GHLSubaccount } from "@/lib/ghl/subaccounts";

interface LinkWhitelabelFormProps {
  subaccount: GHLSubaccount | null;
}

export function LinkWhitelabelForm({ subaccount }: LinkWhitelabelFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const ghlLocationId = subaccount?.id || (formData.get("ghl_location_id") as string);

    try {
      // First, generate a PIT token for the subaccount
      const tokenResponse = await fetch(`/api/admin/whitelabel/generate-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          locationId: ghlLocationId,
        }),
      });

      if (!tokenResponse.ok) {
        const tokenError = await tokenResponse.json();
        throw new Error(tokenError.error || "Failed to generate API token");
      }

      const { token } = await tokenResponse.json();

      // Then, create the whitelabel account in the database
      const response = await fetch("/api/admin/whitelabel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          ghlLocationId,
          ghlApiToken: token,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to link subaccount");
      }

      const account = await response.json();
      router.push(`/admin/whitelabel/${account.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link subaccount");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {subaccount && (
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div>
            <Label className="text-sm font-medium">GHL Location ID</Label>
            <p className="text-sm font-mono text-muted-foreground">{subaccount.id}</p>
          </div>
          {subaccount.name && (
            <div>
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm">{subaccount.name}</p>
            </div>
          )}
          {subaccount.companyName && (
            <div>
              <Label className="text-sm font-medium">Company</Label>
              <p className="text-sm">{subaccount.companyName}</p>
            </div>
          )}
        </div>
      )}

      {!subaccount && (
        <div>
          <Label htmlFor="ghl_location_id">GHL Location ID *</Label>
          <Input
            id="ghl_location_id"
            name="ghl_location_id"
            type="text"
            required
            placeholder="Enter GHL location ID"
            className="mt-1"
          />
        </div>
      )}

      <div>
        <Label htmlFor="name">Account Name *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={subaccount?.name || subaccount?.companyName || ""}
          placeholder="Enter account name"
          className="mt-1"
        />
        <p className="text-xs text-muted-foreground mt-1">
          This name will be used in the platform to identify this whitelabel account
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={loading}>
          {loading ? "Linking..." : "Link Subaccount"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}




