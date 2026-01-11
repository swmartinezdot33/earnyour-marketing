"use client";

import { useEffect, useState } from "react";
import { ProductSalesTable } from "./ProductSalesTable";
import { RevenueTrendsChart } from "./RevenueTrendsChart";
import { TopPerformers } from "./TopPerformers";
import { ConversionRateAnalysis } from "./ConversionRateAnalysis";
import { DateRangePicker } from "./DateRangePicker";
import { ExportButton } from "./ExportButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { arrayToCSV, downloadCSV, formatCurrencyForCSV, formatDateForCSV } from "@/lib/utils/export";
import type { SalesByProduct, RevenueTrend, TopPerformer, ConversionRate } from "@/lib/db/analytics";

interface ProductReportsData {
  salesByProduct: SalesByProduct[];
  revenueTrends: RevenueTrend[];
  topPerformers: {
    byRevenue: TopPerformer[];
    bySales: TopPerformer[];
    byConversion: TopPerformer[];
  };
  conversionRates: ConversionRate[];
}

export function ProductReportsDashboard() {
  const [data, setData] = useState<ProductReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<"30days" | "12months">("30days");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [sortField, setSortField] = useState<keyof SalesByProduct>("revenue");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.set("period", period);
        if (startDate) params.set("startDate", startDate.toISOString());
        if (endDate) params.set("endDate", endDate.toISOString());

        const response = await fetch(`/api/admin/reports/products?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const reportsData = await response.json();
        setData(reportsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchReports();
  }, [period, startDate, endDate]);

  const handleSort = (field: keyof SalesByProduct) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedSalesData = data?.salesByProduct ? [...data.salesByProduct].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];
    const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    return sortDirection === "asc" ? comparison : -comparison;
  }) : [];

  const handleExport = () => {
    if (!data) return;

    const csvData = data.salesByProduct.map((item) => ({
      "Product Name": item.courseTitle,
      "Sales": item.sales,
      "Revenue": formatCurrencyForCSV(item.revenue),
      "Conversion Rate": `${item.conversionRate.toFixed(2)}%`,
    }));

    const csv = arrayToCSV(csvData);
    const filename = `product-reports-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading reports</p>
          <p className="text-muted-foreground text-sm">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Period:</span>
              <Button
                variant={period === "30days" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("30days")}
              >
                30 Days
              </Button>
              <Button
                variant={period === "12months" ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod("12months")}
              >
                12 Months
              </Button>
            </div>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onDateRangeChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
            <div className="ml-auto">
              <ExportButton onExport={handleExport} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different views */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales by Product</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Revenue Trends */}
          <RevenueTrendsChart data={data.revenueTrends} period={period} />

          {/* Top Performers */}
          <TopPerformers
            byRevenue={data.topPerformers.byRevenue}
            bySales={data.topPerformers.bySales}
            byConversion={data.topPerformers.byConversion}
          />
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <ProductSalesTable
            data={sortedSalesData}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <ConversionRateAnalysis data={data.conversionRates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}




