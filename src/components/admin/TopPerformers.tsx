"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Target } from "lucide-react";
import type { TopPerformer } from "@/lib/db/analytics";

interface TopPerformersProps {
  byRevenue: TopPerformer[];
  bySales: TopPerformer[];
  byConversion: TopPerformer[];
}

export function TopPerformers({ byRevenue, bySales, byConversion }: TopPerformersProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const formatMetric = (performer: TopPerformer) => {
    if (performer.metricType === "revenue") {
      return formatCurrency(performer.metric);
    }
    if (performer.metricType === "conversion") {
      return `${performer.metric.toFixed(2)}%`;
    }
    return performer.metric.toString();
  };

  const getMetricLabel = (type: "revenue" | "sales" | "conversion") => {
    switch (type) {
      case "revenue":
        return "Revenue";
      case "sales":
        return "Sales";
      case "conversion":
        return "Conversion Rate";
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Top by Revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top by Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {byRevenue.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available</p>
            ) : (
              byRevenue.map((item, index) => (
                <div
                  key={item.courseId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.courseTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatMetric(item)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top by Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top by Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bySales.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available</p>
            ) : (
              bySales.map((item, index) => (
                <div
                  key={item.courseId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.courseTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatMetric(item)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top by Conversion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5 text-blue-500" />
            Top by Conversion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {byConversion.length === 0 ? (
              <p className="text-muted-foreground text-sm">No data available</p>
            ) : (
              byConversion.map((item, index) => (
                <div
                  key={item.courseId}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                      {index + 1}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.courseTitle}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatMetric(item)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

