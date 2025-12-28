import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { getWhitelabelAccountForUser } from "@/lib/db/whitelabel";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Settings, ExternalLink, Trash2 } from "lucide-react";
import { AccountSettingsForm } from "@/components/dashboard/AccountSettingsForm";
import { DeleteAccountButton } from "@/components/dashboard/DeleteAccountButton";

export const metadata: Metadata = {
  title: "Account Settings | EarnYour Marketing",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.userId);
  const whitelabelAccount = user ? await getWhitelabelAccountForUser(session.userId) : null;

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Your account details and membership information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{user?.email}</p>
              </div>
              
              {user?.name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Name</label>
                  <p className="text-lg">{user.name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                <p className="text-lg">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Account Status</label>
                <p className="text-lg capitalize">{user?.status || "active"}</p>
              </div>

              <AccountSettingsForm user={user} />
            </CardContent>
          </Card>

          {/* Whitelabel GHL Access */}
          {whitelabelAccount && (
            <Card>
              <CardHeader>
                <CardTitle>GoHighLevel Settings</CardTitle>
                <CardDescription>
                  You have access to your EarnYour App GHL account. Manage your settings, automations, and more directly in GoHighLevel.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <a
                    href={`https://app.gohighlevel.com/location/${whitelabelAccount.ghl_location_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open GHL Settings
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Delete Account</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <DeleteAccountButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}







