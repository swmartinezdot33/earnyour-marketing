"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TransactionFilters } from "./TransactionFilters";
import { ExportButton } from "./ExportButton";
import { arrayToCSV, downloadCSV, formatDateForCSV, formatCurrencyForCSV } from "@/lib/utils/export";
import type { TransactionWithDetails } from "@/lib/db/transactions";
import type { Course } from "@/lib/db/schema";

interface EnhancedTransactionsTableProps {
  initialTransactions: TransactionWithDetails[];
  courses?: Course[];
}

export function EnhancedTransactionsTable({
  initialTransactions,
  courses = [],
}: EnhancedTransactionsTableProps) {
  const [transactions, setTransactions] = useState<TransactionWithDetails[]>(initialTransactions);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithDetails[]>(initialTransactions);
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    search?: string;
    status?: "pending" | "completed" | "failed" | "all";
    dateFrom?: Date;
    dateTo?: Date;
    courseId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
  }>({});

  // Apply filters
  useEffect(() => {
    let filtered = [...transactions];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.user.email.toLowerCase().includes(searchLower) ||
          (t.user.name && t.user.name.toLowerCase().includes(searchLower)) ||
          t.course.title.toLowerCase().includes(searchLower) ||
          t.status.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => new Date(t.created_at) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (t) => new Date(t.created_at) <= filters.dateTo!
      );
    }

    if (filters.courseId) {
      filtered = filtered.filter((t) => t.course_id === filters.courseId);
    }

    if (filters.userId) {
      filtered = filtered.filter(
        (t) =>
          filters.userId &&
          (t.user_id === filters.userId ||
          t.user.email.toLowerCase().includes(filters.userId.toLowerCase()))
      );
    }

    if (filters.minAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount >= filters.minAmount!);
    }

    if (filters.maxAmount !== undefined) {
      filtered = filtered.filter((t) => t.amount <= filters.maxAmount!);
    }

    setFilteredTransactions(filtered);
  }, [filters, transactions]);

  const handleToggleExpand = (transactionId: string) => {
    const newExpanded = new Set(expandedTransactions);
    if (newExpanded.has(transactionId)) {
      newExpanded.delete(transactionId);
    } else {
      newExpanded.add(transactionId);
    }
    setExpandedTransactions(newExpanded);
  };

  const handleExport = () => {
    const csvData = filteredTransactions.map((transaction) => ({
      Date: formatDateForCSV(transaction.created_at),
      "User Email": transaction.user.email,
      "User Name": transaction.user.name || "",
      Course: transaction.course.title,
      Amount: formatCurrencyForCSV(transaction.amount, transaction.currency),
      Status: transaction.status,
      "Payment Intent": transaction.stripe_payment_intent_id || "",
      "Checkout Session": transaction.stripe_checkout_session_id,
    }));

    const csv = arrayToCSV(csvData);
    const filename = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Convert cents to dollars
  };

  // Calculate analytics
  const totalRevenue = filteredTransactions
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);
  const averageTransaction = filteredTransactions.length > 0
    ? filteredTransactions.reduce((sum, t) => sum + t.amount, 0) / filteredTransactions.length
    : 0;
  const successRate = filteredTransactions.length > 0
    ? (filteredTransactions.filter((t) => t.status === "completed").length / filteredTransactions.length) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue (Filtered)</p>
            <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Average Transaction</p>
            <p className="text-2xl font-bold">{formatCurrency(averageTransaction)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-2">Success Rate</p>
            <p className="text-2xl font-bold">{successRate.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <TransactionFilters onFiltersChange={setFilters} courses={courses} />
        </CardContent>
      </Card>

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton onExport={handleExport} />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => {
                    const isExpanded = expandedTransactions.has(transaction.id);
                    return (
                      <>
                        <TableRow key={transaction.id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpand(transaction.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            {new Date(transaction.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <Link
                                href={`/admin/users/${transaction.user_id}`}
                                className="font-medium hover:text-primary"
                              >
                                {transaction.user.email}
                              </Link>
                              {transaction.user.name && (
                                <p className="text-sm text-muted-foreground">
                                  {transaction.user.name}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              href={`/admin/courses/${transaction.course_id}/builder`}
                              className="hover:text-primary"
                            >
                              {transaction.course.title}
                            </Link>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </TableCell>
                          <TableCell>
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
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.stripe_checkout_session_id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a
                                  href={`https://dashboard.stripe.com/payments/${transaction.stripe_checkout_session_id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={7} className="bg-muted/50">
                              <div className="p-4 space-y-2 text-sm">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-muted-foreground">Transaction ID</p>
                                    <p className="font-mono text-xs">{transaction.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Payment Intent</p>
                                    <p className="font-mono text-xs">
                                      {transaction.stripe_payment_intent_id || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Checkout Session</p>
                                    <p className="font-mono text-xs">
                                      {transaction.stripe_checkout_session_id}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground">Currency</p>
                                    <p className="font-medium">{transaction.currency.toUpperCase()}</p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

