"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Target } from "lucide-react";
import type { ConversionRate } from "@/lib/db/analytics";

interface ConversionRateAnalysisProps {
  data: ConversionRate[];
}

export function ConversionRateAnalysis({ data }: ConversionRateAnalysisProps) {
  // Get top 10 by conversion rate
  const topData = data
    .filter(item => item.views > 0) // Only show items with views
    .sort((a, b) => b.conversionRate - a.conversionRate)
    .slice(0, 10)
    .map(item => ({
      name: item.courseTitle.length > 20
        ? item.courseTitle.substring(0, 20) + "..."
        : item.courseTitle,
      views: item.views,
      purchases: item.purchases,
      conversionRate: Number(item.conversionRate.toFixed(2)),
    }));

  const averageConversion = data.length > 0
    ? data.reduce((sum, item) => sum + item.conversionRate, 0) / data.length
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Conversion Rate Analysis
          {averageConversion > 0 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (Avg: {averageConversion.toFixed(2)}%)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topData.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No conversion data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip
                formatter={(value: number | undefined, name: string | undefined) => {
                  if (value === undefined || name === undefined) return "";
                  if (name === "conversionRate") {
                    return [`${value}%`, "Conversion Rate"];
                  }
                  return [value, name === "views" ? "Views" : "Purchases"];
                }}
              />
              <Legend />
              <Bar yAxisId="left" dataKey="views" fill="#1A2D4E" name="Views" />
              <Bar yAxisId="left" dataKey="purchases" fill="#EB7030" name="Purchases" />
              <Bar
                yAxisId="right"
                dataKey="conversionRate"
                fill="#10B981"
                name="Conversion Rate (%)"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

