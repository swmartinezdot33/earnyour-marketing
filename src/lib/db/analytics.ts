import { getSupabaseClient } from "./courses";
import type { Course, StripePurchase, Enrollment, User } from "./schema";

export interface DashboardMetrics {
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
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  transactions: number;
}

export interface SalesByProduct {
  courseId: string;
  courseTitle: string;
  sales: number;
  revenue: number;
  conversionRate: number;
}

export interface TopPerformer {
  courseId: string;
  courseTitle: string;
  metric: number;
  metricType: "revenue" | "sales" | "conversion";
}

export interface ConversionRate {
  courseId: string;
  courseTitle: string;
  views: number;
  purchases: number;
  conversionRate: number;
}

/**
 * Get dashboard metrics for admin dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const client = getSupabaseClient();
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get all completed transactions
  const { data: allTransactions, error: transactionsError } = await client
    .from("stripe_purchases")
    .select("amount, status, created_at")
    .eq("status", "completed");

  if (transactionsError) throw transactionsError;

  const transactions = (allTransactions || []) as StripePurchase[];

  // Calculate revenue metrics
  const totalRevenueAllTime = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRevenueThisMonth = transactions
    .filter(t => new Date(t.created_at) >= startOfMonth)
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalRevenueToday = transactions
    .filter(t => new Date(t.created_at) >= startOfToday)
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Get all transactions for counts
  const { data: allTransactionsData, error: allTransactionsError } = await client
    .from("stripe_purchases")
    .select("status");

  if (allTransactionsError) throw allTransactionsError;

  const allTransactionsList = (allTransactionsData || []) as StripePurchase[];
  const completedTransactions = allTransactionsList.filter(t => t.status === "completed").length;
  const pendingTransactions = allTransactionsList.filter(t => t.status === "pending").length;

  // Get user metrics
  const { data: allUsers, error: usersError } = await client
    .from("users")
    .select("status, created_at")
    .is("deleted_at", null);

  if (usersError) throw usersError;

  const users = (allUsers || []) as User[];
  const activeUsers = users.filter(u => u.status === "active").length;
  const newUsersThisMonth = users.filter(
    u => new Date(u.created_at) >= startOfMonth
  ).length;

  // Get course metrics
  const { data: allCourses, error: coursesError } = await client
    .from("courses")
    .select("published");

  if (coursesError) throw coursesError;

  const courses = (allCourses || []) as Course[];
  const publishedCourses = courses.filter(c => c.published).length;
  const draftCourses = courses.filter(c => !c.published).length;

  return {
    totalRevenue: {
      allTime: totalRevenueAllTime,
      thisMonth: totalRevenueThisMonth,
      today: totalRevenueToday,
    },
    totalUsers: {
      active: activeUsers,
      newThisMonth: newUsersThisMonth,
      total: users.length,
    },
    totalCourses: {
      published: publishedCourses,
      draft: draftCourses,
      total: courses.length,
    },
    totalTransactions: {
      completed: completedTransactions,
      pending: pendingTransactions,
      total: allTransactionsList.length,
    },
  };
}

/**
 * Get revenue trends over time
 */
export async function getRevenueTrends(
  period: "30days" | "12months" = "30days"
): Promise<RevenueTrend[]> {
  const client = getSupabaseClient();
  const now = new Date();
  let startDate: Date;

  if (period === "30days") {
    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else {
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  }

  const { data: transactions, error } = await client
    .from("stripe_purchases")
    .select("amount, created_at")
    .eq("status", "completed")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) throw error;

  const transactionsList = (transactions || []) as StripePurchase[];

  // Group by date
  const grouped = transactionsList.reduce((acc, t) => {
    const date = new Date(t.created_at);
    const dateKey = period === "30days" 
      ? date.toISOString().split("T")[0]
      : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    if (!acc[dateKey]) {
      acc[dateKey] = { revenue: 0, transactions: 0 };
    }
    acc[dateKey].revenue += t.amount || 0;
    acc[dateKey].transactions += 1;
    return acc;
  }, {} as Record<string, { revenue: number; transactions: number }>);

  // Convert to array and sort
  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Get sales by product
 */
export async function getSalesByProduct(
  startDate?: Date,
  endDate?: Date
): Promise<SalesByProduct[]> {
  const client = getSupabaseClient();

  let query = client
    .from("stripe_purchases")
    .select(`
      course_id,
      amount,
      status,
      course:courses(id, title)
    `)
    .eq("status", "completed");

  if (startDate) {
    query = query.gte("created_at", startDate.toISOString());
  }
  if (endDate) {
    query = query.lte("created_at", endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  const purchases = (data || []) as Array<{
    course_id: string;
    amount: number;
    status: string;
    course: { id: string; title: string } | null;
  }>;

  // Group by course
  const grouped = purchases.reduce((acc, p) => {
    if (!p.course) return acc;
    const courseId = p.course_id;
    if (!acc[courseId]) {
      acc[courseId] = {
        courseId,
        courseTitle: p.course.title,
        sales: 0,
        revenue: 0,
      };
    }
    acc[courseId].sales += 1;
    acc[courseId].revenue += p.amount || 0;
    return acc;
  }, {} as Record<string, Omit<SalesByProduct, "conversionRate">>);

  // Get enrollment counts for conversion rate calculation
  const { data: enrollments, error: enrollmentsError } = await client
    .from("enrollments")
    .select("course_id");

  if (enrollmentsError) throw enrollmentsError;

  const enrollmentsList = (enrollments || []) as Enrollment[];
  const enrollmentsByCourse = enrollmentsList.reduce((acc, e) => {
    acc[e.course_id] = (acc[e.course_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate conversion rates (simplified: purchases / enrollments)
  return Object.values(grouped).map(item => ({
    ...item,
    conversionRate: enrollmentsByCourse[item.courseId]
      ? (item.sales / enrollmentsByCourse[item.courseId]) * 100
      : 0,
  }));
}

/**
 * Get top performing products
 */
export async function getTopPerformers(
  metricType: "revenue" | "sales" | "conversion" = "revenue",
  limit: number = 10
): Promise<TopPerformer[]> {
  const salesByProduct = await getSalesByProduct();

  let sorted: SalesByProduct[];

  switch (metricType) {
    case "revenue":
      sorted = salesByProduct.sort((a, b) => b.revenue - a.revenue);
      break;
    case "sales":
      sorted = salesByProduct.sort((a, b) => b.sales - a.sales);
      break;
    case "conversion":
      sorted = salesByProduct.sort((a, b) => b.conversionRate - a.conversionRate);
      break;
  }

  return sorted.slice(0, limit).map(item => ({
    courseId: item.courseId,
    courseTitle: item.courseTitle,
    metric: metricType === "revenue" ? item.revenue : metricType === "sales" ? item.sales : item.conversionRate,
    metricType,
  }));
}

/**
 * Get conversion rates for all products
 */
export async function getConversionRates(): Promise<ConversionRate[]> {
  const client = getSupabaseClient();

  // Get all courses
  const { data: courses, error: coursesError } = await client
    .from("courses")
    .select("id, title");

  if (coursesError) throw coursesError;

  const coursesList = (courses || []) as Course[];

  // Get purchases per course
  const { data: purchases, error: purchasesError } = await client
    .from("stripe_purchases")
    .select("course_id")
    .eq("status", "completed");

  if (purchasesError) throw purchasesError;

  const purchasesList = (purchases || []) as StripePurchase[];
  const purchasesByCourse = purchasesList.reduce((acc, p) => {
    acc[p.course_id] = (acc[p.course_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Get enrollments per course (as proxy for views)
  const { data: enrollments, error: enrollmentsError } = await client
    .from("enrollments")
    .select("course_id");

  if (enrollmentsError) throw enrollmentsError;

  const enrollmentsList = (enrollments || []) as Enrollment[];
  const enrollmentsByCourse = enrollmentsList.reduce((acc, e) => {
    acc[e.course_id] = (acc[e.course_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return coursesList.map(course => {
    const views = enrollmentsByCourse[course.id] || 0;
    const purchases = purchasesByCourse[course.id] || 0;
    return {
      courseId: course.id,
      courseTitle: course.title,
      views,
      purchases,
      conversionRate: views > 0 ? (purchases / views) * 100 : 0,
    };
  });
}

