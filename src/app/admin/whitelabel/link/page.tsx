import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function LinkWhitelabelPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Link GHL Subaccount
          </h1>
          <p className="text-muted-foreground">
            GHL agency-level integration has been removed. This feature is no longer available.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Unavailable</CardTitle>
            <CardDescription>
              GHL subaccount linking has been removed from this platform.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is no longer supported. Please use the course platform functionality instead.
            </p>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

