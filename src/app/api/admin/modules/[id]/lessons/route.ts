import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getLessonsByModuleId, createLesson } from "@/lib/db/courses";
import { z } from "zod";

const lessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content_type: z.enum(["video", "text", "quiz", "download"]),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: moduleId } = await params;
    const lessons = await getLessonsByModuleId(moduleId);

    return NextResponse.json({ success: true, lessons });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch lessons" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: moduleId } = await params;
    const body = await request.json();
    const validated = lessonSchema.parse(body);

    // Get current lesson count for order
    const existingLessons = await getLessonsByModuleId(moduleId);
    const order = existingLessons.length;

    const lesson = await createLesson({
      ...validated,
      module_id: moduleId,
      order,
      description: validated.description || null,
      duration_minutes: null,
    });

    return NextResponse.json({ success: true, lesson });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create lesson" },
      { status: 500 }
    );
  }
}

