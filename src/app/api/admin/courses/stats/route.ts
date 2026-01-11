import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getSupabaseClient();

    // Get enrollments per course
    const { data: enrollments } = await client
      .from("enrollments")
      .select("course_id, completed_at");

    // Get purchases per course
    const { data: purchases } = await client
      .from("stripe_purchases")
      .select("course_id, amount")
      .eq("status", "completed");

    const enrollmentsByCourse = (enrollments || []).reduce(
      (acc: Record<string, { total: number; completed: number }>, e: any) => {
        if (!acc[e.course_id]) {
          acc[e.course_id] = { total: 0, completed: 0 };
        }
        acc[e.course_id].total += 1;
        if (e.completed_at) {
          acc[e.course_id].completed += 1;
        }
        return acc;
      },
      {}
    );

    const revenueByCourse = (purchases || []).reduce(
      (acc: Record<string, number>, p: any) => {
        acc[p.course_id] = (acc[p.course_id] || 0) + (p.amount || 0);
        return acc;
      },
      {}
    );

    return NextResponse.json({
      enrollmentsByCourse,
      revenueByCourse,
    });
  } catch (error) {
    console.error("Course stats API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch course stats",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}




