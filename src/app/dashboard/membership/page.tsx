import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { getWhitelabelAccountForUser } from "@/lib/db/whitelabel";
import { getWhitelabelMembershipStatus } from "@/lib/ghl/whitelabel";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { MembershipStatusCard } from "@/components/dashboard/MembershipStatusCard";

export const metadata: Metadata = {
  title: "Membership Status | EarnYour Marketing",
  description: "View your membership status and course access",
};

export default async function MembershipPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.userId);
  const whitelabelAccount = user ? await getWhitelabelAccountForUser(session.userId) : null;
  
  let membershipStatus = null;
  if (whitelabelAccount) {
    membershipStatus = await getWhitelabelMembershipStatus(
      session.userId,
      whitelabelAccount.id
    );
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Membership Status
          </h1>
          <p className="text-muted-foreground">
            View your membership tier, enrolled courses, and account details
          </p>
        </div>

        {whitelabelAccount ? (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{whitelabelAccount.name}</CardTitle>
                    <CardDescription>
                      Your EarnYour App membership account
                    </CardDescription>
                  </div>
                  <Badge variant="default">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {membershipStatus ? (
                  <MembershipStatusCard status={membershipStatus} />
                ) : (
                  <p className="text-muted-foreground">
                    No membership status found. Please contact support if you believe this is an error.
                  </p>
                )}
              </CardContent>
            </Card>

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
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                You don't have a whitelabel membership account yet.
              </p>
              <p className="text-sm text-muted-foreground">
                If you've purchased a course, your membership will be activated automatically.
              </p>
            </CardContent>
          </Card>
        )}
      </Container>
    </Section>
  );
}

