import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { CouponsManager } from "@/components/admin/CouponsManager";

export const metadata: Metadata = {
  title: "Admin - Coupon Codes | EarnYour Marketing",
  description: "Manage coupon codes",
};

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Coupon Code Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage coupon codes for customers
          </p>
        </div>

        <CouponsManager />
      </Container>
    </div>
  );
}

