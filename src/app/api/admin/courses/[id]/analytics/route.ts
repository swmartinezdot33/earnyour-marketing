import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Enrollment, Progress, StripePurchase } from "@/lib/db/schema";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;
    const client = getSupabaseClient();

    // Get enrollments
    const { data: enrollments, error: enrollmentsError } = await client
      .from("enrollments")
      .select("*")
      .eq("course_id", courseId);

    if (enrollmentsError) throw enrollmentsError;
    const enrollmentsData = (enrollments || []) as Enrollment[];

    // Get modules for this course
    const { data: modulesData, error: modulesError } = await client
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (modulesError) throw modulesError;

    // Explicitly cast to array of objects with id to avoid implicit any/never issues
    const modules = (modulesData || []) as { id: string }[];
    const moduleIds = modules.map((m) => m.id);

    // Get lessons for these modules
    const { data: lessonsData, error: lessonsError } = await client
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    if (lessonsError) throw lessonsError;

    const lessons = (lessonsData || []) as { id: string }[];
    const lessonIds = lessons.map((l) => l.id);

    // Get progress data
    const { data: progress, error: progressError } = await client
      .from("progress")
      .select("*")
      .in("lesson_id", lessonIds);

    if (progressError) throw progressError;
    const progressData = (progress || []) as Progress[];

    // Get purchases
    const { data: purchases, error: purchasesError } = await client
      .from("stripe_purchases")
      .select("*")
      .eq("course_id", courseId);

    if (purchasesError) throw purchasesError;
    const purchasesData = (purchases || []) as StripePurchase[];

    // Calculate analytics
    const totalEnrollments = enrollmentsData.length;
    const activeEnrollments = enrollmentsData.filter((e) => !e.completed_at).length;
    const totalRevenue = purchasesData
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalSales = purchasesData.filter((p) => p.status === "completed").length;

    // Calculate completion rates
    const completedProgress = progressData.filter((p) => p.completed).length;
    const totalProgress = progressData.length;
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    // Calculate average progress
    const progressByUser = new Map<string, number[]>();
    progressData.forEach((p) => {
      if (!progressByUser.has(p.user_id)) {
        progressByUser.set(p.user_id, []);
      }
      progressByUser.get(p.user_id)?.push(p.progress_percentage || 0);
    });

    const userAverages = Array.from(progressByUser.values()).map((percentages) => {
      return percentages.reduce((sum, p) => sum + p, 0) / percentages.length;
    });

    const averageProgress =
      userAverages.length > 0
        ? userAverages.reduce((sum, avg) => sum + avg, 0) / userAverages.length
        : 0;

    // Get recent enrollments
    const recentEnrollments = enrollmentsData
      .sort((a, b) => new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime())
      .slice(0, 10)
      .map((e) => ({
        id: e.id,
        created_at: e.enrolled_at,
        user_email: e.user_id, // You might want to join with users table
      }));

    // Get top performing lessons
    const lessonProgress = new Map<string, { completed: number; total: number }>();
    progressData.forEach((p) => {
      if (!lessonProgress.has(p.lesson_id)) {
        lessonProgress.set(p.lesson_id, { completed: 0, total: 0 });
      }
      const stats = lessonProgress.get(p.lesson_id)!;
      stats.total++;
      if (p.completed) stats.completed++;
    });

    const topLessons = Array.from(lessonProgress.entries())
      .map(([lessonId, stats]) => ({
        id: lessonId,
        completion_rate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0,
        title: "Lesson", // You might want to join with lessons table
      }))
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      analytics: {
        totalEnrollments,
        activeEnrollments,
        totalRevenue,
        totalSales,
        completionRate,
        averageProgress,
        completedStudents: progressByUser.size,
        recentEnrollments,
        topLessons,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

