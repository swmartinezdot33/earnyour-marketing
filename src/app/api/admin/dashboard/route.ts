import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getDashboardMetrics,
  getRevenueTrends,
  getSalesByProduct,
} from "@/lib/db/analytics";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Course, User, StripePurchase, Enrollment } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

interface RecentActivity {
  type: "user_registered" | "purchase" | "course_completed" | "course_published";
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  courseId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get dashboard metrics
    const metrics = await getDashboardMetrics();

    // Get revenue trends (last 30 days)
    const revenueTrends = await getRevenueTrends("30days");

    // Get top 10 products by sales
    const salesByProduct = await getSalesByProduct();
    const topProducts = salesByProduct
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 10);

    // Get recent activity
    const client = getSupabaseClient();
    const activities: RecentActivity[] = [];

    // Recent user registrations (last 10)
    const { data: recentUsers } = await client
      .from("users")
      .select("id, email, name, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentUsers) {
      (recentUsers as User[]).forEach((user) => {
        activities.push({
          type: "user_registered",
          title: "New User Registered",
          description: user.name || user.email,
          timestamp: user.created_at,
          userId: user.id,
        });
      });
    }

    // Recent purchases (last 10)
    const { data: recentPurchases } = await client
      .from("stripe_purchases")
      .select(`
        id,
        user_id,
        course_id,
        amount,
        created_at,
        course:courses(title),
        user:users(email, name)
      `)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(10);

    if (recentPurchases) {
      (recentPurchases as any[]).forEach((purchase) => {
        activities.push({
          type: "purchase",
          title: "New Purchase",
          description: `${purchase.user?.name || purchase.user?.email} purchased ${purchase.course?.title || "Course"}`,
          timestamp: purchase.created_at,
          userId: purchase.user_id,
          courseId: purchase.course_id,
        });
      });
    }

    // Recent course completions (last 10)
    const { data: recentCompletions } = await client
      .from("enrollments")
      .select(`
        id,
        user_id,
        course_id,
        completed_at,
        course:courses(title),
        user:users(email, name)
      `)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(10);

    if (recentCompletions) {
      (recentCompletions as any[]).forEach((enrollment) => {
        activities.push({
          type: "course_completed",
          title: "Course Completed",
          description: `${enrollment.user?.name || enrollment.user?.email} completed ${enrollment.course?.title || "Course"}`,
          timestamp: enrollment.completed_at,
          userId: enrollment.user_id,
          courseId: enrollment.course_id,
        });
      });
    }

    // Recent course publications (last 10)
    const { data: recentPublications } = await client
      .from("courses")
      .select("id, title, updated_at")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(10);

    if (recentPublications) {
      (recentPublications as Course[]).forEach((course) => {
        activities.push({
          type: "course_published",
          title: "Course Published",
          description: course.title,
          timestamp: course.updated_at,
          courseId: course.id,
        });
      });
    }

    // Sort activities by timestamp (most recent first) and limit to 20
    const recentActivity = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return NextResponse.json({
      metrics,
      revenueTrends,
      topProducts,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch dashboard data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




