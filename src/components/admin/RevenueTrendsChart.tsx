"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils/charts";

interface RevenueTrendsChartProps {
  data: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  period: "30days" | "12months";
}

export function RevenueTrendsChart({ data, period }: RevenueTrendsChartProps) {
  const chartData = data.map((item) => ({
    date: period === "30days"
      ? format(new Date(item.date), "MMM d")
      : format(new Date(item.date), "MMM yyyy"),
    revenue: item.revenue / 100, // Convert cents to dollars
    transactions: item.transactions,
  }));

  // Calculate comparison to previous period
  const currentPeriodTotal = data.reduce((sum, item) => sum + item.revenue, 0) / 100;
  const previousPeriodTotal = data.length > 0
    ? (data.slice(0, Math.floor(data.length / 2)).reduce((sum, item) => sum + item.revenue, 0) / 100)
    : 0;
  const change = previousPeriodTotal > 0
    ? ((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Revenue Trends ({period === "30days" ? "Last 30 Days" : "Last 12 Months"})
          {change !== 0 && (
            <span className={`text-sm font-normal ml-2 ${change > 0 ? "text-green-600" : "text-red-600"}`}>
              ({change > 0 ? "+" : ""}{change.toFixed(1)}% vs previous period)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip
              formatter={(value: number | undefined, name: string | undefined) => {
                if (value === undefined || name === undefined) return "";
                if (name === "revenue") {
                  return [formatCurrency(value * 100), "Revenue"];
                }
                return [value, "Transactions"];
              }}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#EB7030"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="transactions"
              stroke="#1A2D4E"
              strokeWidth={2}
              name="Transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

