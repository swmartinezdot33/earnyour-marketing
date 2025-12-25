import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getGHLSubaccountById } from "@/lib/ghl/subaccounts";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LinkWhitelabelForm } from "@/components/admin/LinkWhitelabelForm";

export default async function LinkWhitelabelPage({
  searchParams,
}: {
  searchParams: Promise<{ ghl_location_id?: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const params = await searchParams;
  const ghlLocationId = params.ghl_location_id;

  let subaccount = null;
  if (ghlLocationId) {
    try {
      subaccount = await getGHLSubaccountById(ghlLocationId);
    } catch (error) {
      console.error("Error fetching subaccount:", error);
    }
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Link GHL Subaccount
          </h1>
          <p className="text-muted-foreground">
            Link a GHL subaccount to create a whitelabel account in the database
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subaccount Details</CardTitle>
            <CardDescription>
              {subaccount
                ? `Linking: ${subaccount.name || subaccount.companyName || subaccount.id}`
                : "Enter the GHL location ID to link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkWhitelabelForm subaccount={subaccount} />
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

