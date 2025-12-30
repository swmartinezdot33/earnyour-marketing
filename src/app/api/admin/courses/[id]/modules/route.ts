import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getModulesWithLessons } from "@/lib/db/courses-optimized";
import { createModule } from "@/lib/db/courses";
import { z } from "zod";

const moduleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
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

    const { id: courseId } = await params;
    // Optimized: Get modules with lessons in a single query
    const modules = await getModulesWithLessons(courseId);

    return NextResponse.json({ success: true, modules });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch modules" },
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

    const { id: courseId } = await params;
    const body = await request.json();
    const validated = moduleSchema.parse(body);

    // Get current module count for order
    const existingModules = await getModulesWithLessons(courseId);
    const order = existingModules.length;

    const module = await createModule({
      ...validated,
      course_id: courseId,
      order,
      description: validated.description || null,
    });

    return NextResponse.json({ success: true, module });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    );
  }
}

