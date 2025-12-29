import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Course, Module, Lesson } from "@/lib/db/schema";

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

    // Get course
    const { data: course, error: courseError } = await client
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError) throw courseError;
    const courseData = course as Course;

    // Get modules
    const { data: modules, error: modulesError } = await client
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order", { ascending: true });

    if (modulesError) throw modulesError;
    const modulesData = (modules || []) as Module[];

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modulesData.map(async (module: Module) => {
        const { data: lessons, error: lessonsError } = await client
          .from("lessons")
          .select("*")
          .eq("module_id", module.id)
          .order("order", { ascending: true });

        if (lessonsError) throw lessonsError;
        const lessonsData = (lessons || []) as Lesson[];

        // Get lesson content
        const lessonsWithContent = await Promise.all(
          lessonsData.map(async (lesson) => {
            const { data: content, error: contentError } = await client
              .from("lesson_content")
              .select("*")
              .eq("lesson_id", lesson.id)
              .single();

            if (contentError && contentError.code !== "PGRST116") throw contentError;

            return {
              ...lesson,
              content: content || null,
            };
          })
        );

        return {
          ...module,
          lessons: lessonsWithContent,
        };
      })
    );

    const exportData = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      course: {
        ...courseData,
        modules: modulesWithLessons,
      },
    };

    return NextResponse.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error("Error exporting course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to export course" },
      { status: 500 }
    );
  }
}

