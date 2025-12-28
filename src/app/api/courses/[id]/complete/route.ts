import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { markCourseComplete } from "@/lib/db/enrollments";
import { getSupabaseClient } from "@/lib/db/courses";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: courseId } = await params;

    // Mark course as complete
    await markCourseComplete(session.userId, courseId);

    // Get course details (for potential future use, e.g. certificates)
    const supabase = getSupabaseClient();
    await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course completion error:", error);
    return NextResponse.json(
      { error: "Failed to mark course complete" },
      { status: 500 }
    );
  }
}

