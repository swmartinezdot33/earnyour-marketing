import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { ProductReportsDashboard } from "@/components/admin/ProductReportsDashboard";

export const metadata: Metadata = {
  title: "Product Reports | EarnYour Marketing",
  description: "Product sales and revenue analytics",
};

export const dynamic = "force-dynamic";

export default async function ProductReportsPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Product Reports
          </h1>
          <p className="text-muted-foreground">
            Analyze product performance, sales, and conversion rates
          </p>
        </div>

        <ProductReportsDashboard />
      </Container>
    </div>
  );
}

