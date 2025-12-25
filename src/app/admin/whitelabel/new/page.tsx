"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function NewWhitelabelAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"existing" | "create">("existing");

  async function handleSubmitExisting(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      ghlLocationId: formData.get("ghlLocationId") as string,
      ghlApiToken: formData.get("ghlApiToken") as string,
      branding: {
        logo: formData.get("logo") as string || undefined,
        primaryColor: formData.get("primaryColor") as string || undefined,
        secondaryColor: formData.get("secondaryColor") as string || undefined,
      },
    };

    try {
      const response = await fetch("/api/admin/whitelabel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create whitelabel account");
      }

      const result = await response.json();
      router.push(`/admin/whitelabel/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateNew(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      companyName: formData.get("companyName") as string || undefined,
      email: formData.get("email") as string || undefined,
      phone: formData.get("phone") as string || undefined,
      website: formData.get("website") as string || undefined,
      branding: {
        logo: formData.get("logo") as string || undefined,
        primaryColor: formData.get("primaryColor") as string || undefined,
        secondaryColor: formData.get("secondaryColor") as string || undefined,
      },
    };

    try {
      const response = await fetch("/api/admin/whitelabel/create-subaccount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create subaccount");
      }

      const result = await response.json();
      router.push(`/admin/whitelabel/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create Whitelabel Account</CardTitle>
          <CardDescription>
            Create a new GHL subaccount or link an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "create")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">Link Existing Subaccount</TabsTrigger>
              <TabsTrigger value="create">
                Create New Subaccount
                <Badge variant="secondary" className="ml-2">SaaS</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-6 mt-6">
              <form onSubmit={handleSubmitExisting} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Account Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="EarnYour App"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ghlLocationId">GHL Location ID</Label>
                  <Input
                    id="ghlLocationId"
                    name="ghlLocationId"
                    placeholder="location_abc123..."
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    Find this in GHL: Settings → Locations → [Your Location] → Check URL or Location Settings
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ghlApiToken">GHL API Token (PIT Token)</Label>
                  <Textarea
                    id="ghlApiToken"
                    name="ghlApiToken"
                    placeholder="Enter your GHL API token"
                    required
                    rows={3}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get this from GHL: Settings → Integrations → API → Create New Token
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Required permissions: Contacts, Tags, Custom Fields, Pipelines, Automations
                  </p>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Branding (Optional)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo URL</Label>
                    <Input
                      id="logo"
                      name="logo"
                      type="url"
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
                        defaultValue="#FF6B35"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        type="color"
                        defaultValue="#004E89"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating..." : "Create Account"}
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="create" className="space-y-6 mt-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
                <p className="text-sm text-blue-800">
                  <strong>Create New Subaccount:</strong> This will create a brand new GHL subaccount 
                  under your agency account and automatically generate API credentials. Requires your 
                  agency-level PIT token to be configured.
                </p>
              </div>

              <form onSubmit={handleCreateNew} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Account Name</Label>
                  <Input
                    id="create-name"
                    name="name"
                    placeholder="EarnYour App - Customer Name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name (Optional)</Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="Customer Company Name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website (Optional)</Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    placeholder="https://example.com"
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-semibold">Branding (Optional)</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="create-logo">Logo URL</Label>
                    <Input
                      id="create-logo"
                      name="logo"
                      type="url"
                      placeholder="https://example.com/logo.png"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="create-primaryColor">Primary Color</Label>
                      <Input
                        id="create-primaryColor"
                        name="primaryColor"
                        type="color"
                        defaultValue="#FF6B35"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="create-secondaryColor">Secondary Color</Label>
                      <Input
                        id="create-secondaryColor"
                        name="secondaryColor"
                        type="color"
                        defaultValue="#004E89"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating Subaccount..." : "Create Subaccount & Account"}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
