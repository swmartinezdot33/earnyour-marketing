import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | EarnYour Marketing",
  description: "Admin dashboard with metrics and analytics",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your platform metrics and recent activity
          </p>
        </div>

        <AdminDashboard />
      </Container>
    </div>
  );
}

