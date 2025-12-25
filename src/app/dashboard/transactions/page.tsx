import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserTransactions } from "@/lib/db/transactions";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionsList } from "@/components/dashboard/TransactionsList";

export const metadata: Metadata = {
  title: "Transaction History | EarnYour Marketing",
  description: "View your purchase history",
};

export default async function TransactionsPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const transactions = await getUserTransactions(session.userId);

  // Calculate totals
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCourses = new Set(transactions.map(t => t.course_id)).size;

  // Format currency
  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
              Transaction History
            </h1>
            <p className="text-muted-foreground">
              View all your course purchases and receipts
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {formatCurrency(totalSpent, transactions[0]?.currency || "usd")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{transactions.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Courses Purchased
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalCourses}</p>
            </CardContent>
          </Card>
        </div>

        {/* Transactions List */}
        <TransactionsList transactions={transactions} />
      </Container>
    </Section>
  );
}

