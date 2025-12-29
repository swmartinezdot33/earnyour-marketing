import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTransactions } from "@/lib/db/transactions";
import { getAllCourses } from "@/lib/db/courses";
import { Container } from "@/components/layout/Container";
import { Receipt } from "lucide-react";
import { EnhancedTransactionsTable } from "@/components/admin/EnhancedTransactionsTable";

export const metadata: Metadata = {
  title: "Admin - Transactions | EarnYour Marketing",
  description: "View all transactions",
};

export default async function AdminTransactionsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const [transactions, courses] = await Promise.all([
    getAllTransactions(),
    getAllCourses(false),
  ]);

  return (
    <div className="p-8">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2 flex items-center gap-3">
            <Receipt className="h-8 w-8" />
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View and manage all transactions with advanced filtering and analytics
          </p>
        </div>

        {/* Enhanced Transactions Table */}
        <EnhancedTransactionsTable
          initialTransactions={transactions}
          courses={courses}
        />
      </Container>
    </div>
  );
}







