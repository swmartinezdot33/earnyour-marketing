import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateLessonProgress } from "@/lib/db/progress";
import { z } from "zod";

const progressSchema = z.object({
  completed: z.boolean().optional(),
  progress_percentage: z.number().min(0).max(100).optional(),
  last_position: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();
    const validated = progressSchema.parse(body);

    await updateLessonProgress(session.userId, lessonId, validated);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

