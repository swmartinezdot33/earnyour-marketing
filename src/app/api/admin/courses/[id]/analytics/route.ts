import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";

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

    // Get modules for this course
    const { data: modulesData, error: modulesError } = await client
      .from("modules")
      .select("id")
      .eq("course_id", courseId);

    if (modulesError) throw modulesError;

    const moduleIds = (modulesData || []).map((m: { id: string }) => m.id);

    // Get lessons for these modules
    const { data: lessonsData, error: lessonsError } = await client
      .from("lessons")
      .select("id")
      .in("module_id", moduleIds);

    if (lessonsError) throw lessonsError;

    const lessonIds = (lessonsData || []).map((l: { id: string }) => l.id);

    // Get progress data
    const { data: progress, error: progressError } = await client
      .from("progress")
      .select("*")
      .in("lesson_id", lessonIds);

    if (progressError) throw progressError;

    // Get purchases
    const { data: purchases, error: purchasesError } = await client
      .from("stripe_purchases")
      .select("*")
      .eq("course_id", courseId);

    if (purchasesError) throw purchasesError;

    // Calculate analytics
    const totalEnrollments = enrollments?.length || 0;
    const activeEnrollments = enrollments?.filter((e) => e.active).length || 0;
    const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount_paid || 0), 0) || 0;
    const totalSales = purchases?.length || 0;

    // Calculate completion rates
    const completedProgress = progress?.filter((p) => p.completed).length || 0;
    const totalProgress = progress?.length || 0;
    const completionRate = totalProgress > 0 ? (completedProgress / totalProgress) * 100 : 0;

    // Calculate average progress
    const progressByUser = new Map<string, number[]>();
    progress?.forEach((p) => {
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
    const recentEnrollments = enrollments
      ?.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
      .map((e) => ({
        id: e.id,
        created_at: e.created_at,
        user_email: e.user_id, // You might want to join with users table
      })) || [];

    // Get top performing lessons
    const lessonProgress = new Map<string, { completed: number; total: number }>();
    progress?.forEach((p) => {
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

