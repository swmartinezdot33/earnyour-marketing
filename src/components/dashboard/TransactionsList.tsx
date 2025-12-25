"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Receipt } from "lucide-react";

interface Transaction {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  created_at: string;
  stripe_checkout_session_id: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
}

export function TransactionsList({ transactions }: TransactionsListProps) {
  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const exportToCSV = () => {
    const csv = [
      ["Date", "Course", "Amount", "Status"].join(","),
      ...transactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        `"${t.course.title}"`,
        t.amount,
        t.status,
      ].join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            When you purchase a course, it will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">
                        {transaction.course.title}
                      </h3>
                      <Badge
                        variant={
                          transaction.status === "completed"
                            ? "default"
                            : transaction.status === "pending"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brand-navy">
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                    {transaction.stripe_checkout_session_id && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Session: {transaction.stripe_checkout_session_id.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}




