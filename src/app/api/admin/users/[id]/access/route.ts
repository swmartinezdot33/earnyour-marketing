import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById } from "@/lib/db/users";
import { enrollUserInCourse, isUserEnrolled } from "@/lib/db/enrollments";
import { getSupabaseClient } from "@/lib/db/courses";
import { z } from "zod";

const updateAccessSchema = z.object({
  courseId: z.string(),
  grantAccess: z.boolean(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateAccessSchema.parse(body);

    // Verify user exists
    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (validated.grantAccess) {
      // Grant access
      const alreadyEnrolled = await isUserEnrolled(id, validated.courseId);
      if (!alreadyEnrolled) {
        await enrollUserInCourse(id, validated.courseId);
      }
    } else {
      // Revoke access - soft delete enrollment
      const supabase = getSupabaseClient();
      await (supabase.from("enrollments") as any)
        .update({ completed: false })
        .eq("user_id", id)
        .eq("course_id", validated.courseId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error updating course access:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update course access" },
      { status: 500 }
    );
  }
}

