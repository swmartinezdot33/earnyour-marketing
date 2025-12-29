"use client";

import { useEffect, useState } from "react";
import { MetricsCard } from "./MetricsCard";
import {
  DollarSign,
  Users,
  BookOpen,
  Receipt,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import { StripeWarningBanner } from "./StripeWarningBanner";

interface DashboardData {
  metrics: {
    totalRevenue: {
      allTime: number;
      thisMonth: number;
      today: number;
    };
    totalUsers: {
      active: number;
      newThisMonth: number;
      total: number;
    };
    totalCourses: {
      published: number;
      draft: number;
      total: number;
    };
    totalTransactions: {
      completed: number;
      pending: number;
      total: number;
    };
  };
  revenueTrends: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  topProducts: Array<{
    courseId: string;
    courseTitle: string;
    sales: number;
    revenue: number;
    conversionRate: number;
  }>;
  recentActivity: Array<{
    type: string;
    title: string;
    description: string;
    timestamp: string;
    userId?: string;
    courseId?: string;
  }>;
}

export function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const dashboardData = await response.json();
        setData(dashboardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading dashboard</p>
          <p className="text-muted-foreground text-sm">{error || "Unknown error"}</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100); // Assuming amounts are in cents
  };

  // Format revenue trends for chart
  const revenueChartData = data.revenueTrends.map((item) => ({
    date: format(new Date(item.date), "MMM d"),
    revenue: item.revenue / 100, // Convert cents to dollars
    transactions: item.transactions,
  }));

  // Format top products for chart
  const topProductsChartData = data.topProducts
    .slice(0, 10)
    .map((product) => ({
      name: product.courseTitle.length > 20
        ? product.courseTitle.substring(0, 20) + "..."
        : product.courseTitle,
      sales: product.sales,
      revenue: product.revenue / 100,
    }));

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registered":
        return "👤";
      case "purchase":
        return "💰";
      case "course_completed":
        return "✅";
      case "course_published":
        return "📚";
      default:
        return "📌";
    }
  };

  return (
    <div className="space-y-8">
      {/* Stripe Warning Banner */}
      <StripeWarningBanner />

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link href="/admin/courses/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Course
          </Button>
        </Link>
        <Link href="/admin/users/new">
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            New User
          </Button>
        </Link>
        <Link href="/admin/reports/products">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            View Reports
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Revenue"
          value={formatCurrency(data.metrics.totalRevenue.allTime)}
          description={`$${(data.metrics.totalRevenue.thisMonth / 100).toLocaleString()} this month`}
          icon={DollarSign}
        />
        <MetricsCard
          title="Total Users"
          value={data.metrics.totalUsers.total}
          description={`${data.metrics.totalUsers.newThisMonth} new this month`}
          icon={Users}
        />
        <MetricsCard
          title="Total Courses"
          value={data.metrics.totalCourses.total}
          description={`${data.metrics.totalCourses.published} published, ${data.metrics.totalCourses.draft} draft`}
          icon={BookOpen}
        />
        <MetricsCard
          title="Transactions"
          value={data.metrics.totalTransactions.total}
          description={`${data.metrics.totalTransactions.completed} completed, ${data.metrics.totalTransactions.pending} pending`}
          icon={Receipt}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value: number | undefined) => {
                    if (value === undefined) return "";
                    return formatCurrency(value * 100);
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#EB7030"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Top Products by Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductsChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#1A2D4E" name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No recent activity
              </p>
            ) : (
              data.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="text-2xl">{getActivityIcon(activity.type)}</div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                    </p>
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

