import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getAllGHLSubaccounts, type GHLSubaccount } from "@/lib/ghl/subaccounts";
import { getAllWhitelabelAccounts } from "@/lib/db/whitelabel";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Plus, RefreshCw } from "lucide-react";
import { WhitelabelAccountsList } from "@/components/admin/WhitelabelAccountsList";

export default async function WhitelabelAccountsPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  // Fetch all subaccounts directly from GHL agency account
  let ghlSubaccounts: GHLSubaccount[] = [];
  let error: string | null = null;
  
  try {
    ghlSubaccounts = await getAllGHLSubaccounts();
  } catch (err) {
    console.error("Error fetching GHL subaccounts:", err);
    error = err instanceof Error ? err.message : "Failed to fetch subaccounts";
  }

  // Also get database records for matching/syncing purposes
  const dbWhitelabelAccounts = await getAllWhitelabelAccounts();

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
              Whitelabel Accounts
            </h1>
            <p className="text-muted-foreground">
              All GHL subaccounts from your agency account
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              These are all subaccounts managed under your GHL agency account.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/whitelabel/new">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Link New Account
              </Button>
            </Link>
            <Link href="/admin/whitelabel">
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <Card className="border-destructive mb-6">
            <CardContent className="py-4">
              <p className="text-destructive">
                Error fetching subaccounts: {error}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Make sure GHL_AGENCY_PIT_TOKEN is set correctly.
              </p>
            </CardContent>
          </Card>
        )}

        <WhitelabelAccountsList 
          ghlSubaccounts={ghlSubaccounts} 
          dbWhitelabelAccounts={dbWhitelabelAccounts}
        />
      </Container>
    </Section>
  );
}

