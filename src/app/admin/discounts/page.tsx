import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { DiscountsManager } from "@/components/admin/DiscountsManager";

export const metadata: Metadata = {
  title: "Admin - Discounts | EarnYour Marketing",
  description: "Manage discounts and promotions",
};

export const dynamic = "force-dynamic";

export default async function AdminDiscountsPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Discount Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage discounts for courses and bundles
          </p>
        </div>

        <DiscountsManager />
      </Container>
    </div>
  );
}

