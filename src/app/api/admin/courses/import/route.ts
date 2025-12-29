import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import { z } from "zod";

const importSchema = z.object({
  course: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().optional(),
    short_description: z.string().optional(),
    price: z.number().optional(),
    image_url: z.string().optional(),
    modules: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        order: z.number().optional(),
        lessons: z.array(
          z.object({
            title: z.string(),
            description: z.string().optional(),
            content_type: z.enum(["video", "text", "quiz", "download"]),
            order: z.number().optional(),
            content: z.any().optional(),
          })
        ),
      })
    ),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = importSchema.parse(body);

    const client = getSupabaseClient();

    // Create course
    const { data: course, error: courseError } = await (client.from("courses") as any)
      .insert([
        {
          title: validated.course.title,
          slug: validated.course.slug || validated.course.title.toLowerCase().replace(/\s+/g, "-"),
          description: validated.course.description || "",
          short_description: validated.course.short_description || "",
          price: validated.course.price || 0,
          image_url: validated.course.image_url || null,
          published: false,
        },
      ])
      .select()
      .single();

    if (courseError) throw courseError;

    // Create modules and lessons
    for (const moduleData of validated.course.modules || []) {
      const { data: module, error: moduleError } = await (client.from("modules") as any)
        .insert([
          {
            course_id: course.id,
            title: moduleData.title,
            description: moduleData.description || null,
            order: moduleData.order || 0,
          },
        ])
        .select()
        .single();

      if (moduleError) throw moduleError;

      // Create lessons
      for (const lessonData of moduleData.lessons || []) {
        const { data: lesson, error: lessonError } = await (client.from("lessons") as any)
          .insert([
            {
              module_id: module.id,
              title: lessonData.title,
              description: lessonData.description || null,
              content_type: lessonData.content_type,
              order: lessonData.order || 0,
            },
          ])
          .select()
          .single();

        if (lessonError) throw lessonError;

        // Create lesson content if provided
        if (lessonData.content) {
          await (client.from("lesson_content") as any).insert([
            {
              lesson_id: lesson.id,
              content: lessonData.content.content || "",
              video_url: lessonData.content.video_url || null,
              video_provider: lessonData.content.video_provider || null,
              download_url: lessonData.content.download_url || null,
            },
          ]);
        }
      }
    }

    return NextResponse.json({
      success: true,
      courseId: course.id,
      message: "Course imported successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error importing course:", error);
    return NextResponse.json(
      { success: false, error: "Failed to import course" },
      { status: 500 }
    );
  }
}

