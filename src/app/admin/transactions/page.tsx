import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTransactions } from "@/lib/db/transactions";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Receipt, DollarSign, TrendingUp } from "lucide-react";
import { AdminTransactionsTable } from "@/components/admin/AdminTransactionsTable";

export const metadata: Metadata = {
  title: "Admin - Transactions | EarnYour Marketing",
  description: "View all transactions",
};

export default async function AdminTransactionsPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const transactions = await getAllTransactions();

  // Calculate analytics
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedTransactions = transactions.filter(t => t.status === "completed");
  const completedRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  // Revenue by month
  const revenueByMonth = transactions.reduce((acc, t) => {
    const month = new Date(t.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long" });
    acc[month] = (acc[month] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2 flex items-center gap-3">
            <Receipt className="h-8 w-8" />
            Transaction History
          </h1>
          <p className="text-muted-foreground">
            View all transactions across all users
          </p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {transactions.length > 0
                  ? formatCurrency(totalRevenue, transactions[0].currency)
                  : "$0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Completed Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {completedTransactions.length > 0
                  ? formatCurrency(completedRevenue, completedTransactions[0].currency)
                  : "$0.00"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{transactions.length}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {completedTransactions.length} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions Table */}
        <AdminTransactionsTable transactions={transactions} />
      </Container>
    </Section>
  );
}




