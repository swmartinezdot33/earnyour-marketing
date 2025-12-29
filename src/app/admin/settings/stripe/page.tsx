import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { StripeSetup } from "@/components/admin/StripeSetup";

export const metadata: Metadata = {
  title: "Stripe Setup | EarnYour Marketing",
  description: "Configure Stripe integration",
};

export const dynamic = "force-dynamic";

export default async function StripeSetupPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Stripe Setup
          </h1>
          <p className="text-muted-foreground">
            Configure your Stripe integration to enable payments for courses
          </p>
        </div>

        <StripeSetup />
      </Container>
    </div>
  );
}

