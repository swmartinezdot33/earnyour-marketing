import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import { z } from "zod";

const contentSchema = z.object({
  lesson_id: z.string(),
  content: z.string().optional(),
  video_url: z.string().url().optional().nullable(),
  video_provider: z.enum(["youtube", "vimeo", "mux", "custom"]).optional().nullable(),
  download_url: z.string().url().optional().nullable(),
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

    const { id: lessonId } = await params;
    const client = getSupabaseClient();

    // Get lesson
    const { data: lesson, error: lessonError } = await client
      .from("lessons")
      .select("*")
      .eq("id", lessonId)
      .single();

    if (lessonError) throw lessonError;

    // Get content
    const { data: content, error: contentError } = await client
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lessonId)
      .single();

    if (contentError && contentError.code !== "PGRST116") throw contentError;

    return NextResponse.json({
      success: true,
      lesson,
      content: content || null,
    });
  } catch (error) {
    console.error("Error fetching lesson content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch lesson content" },
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

    const { id: lessonId } = await params;
    const body = await request.json();
    const validated = contentSchema.parse({ ...body, lesson_id: lessonId });

    const client = getSupabaseClient();
    const { data, error } = await (client.from("lesson_content") as any)
      .insert([
        {
          lesson_id: validated.lesson_id,
          content: validated.content || "",
          video_url: validated.video_url || null,
          video_provider: validated.video_provider || null,
          download_url: validated.download_url || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, content: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error creating lesson content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create lesson content" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: lessonId } = await params;
    const body = await request.json();
    const validated = contentSchema.partial().parse(body);

    const client = getSupabaseClient();
    const updates: any = {};
    if (validated.content !== undefined) updates.content = validated.content;
    if (validated.video_url !== undefined) updates.video_url = validated.video_url;
    if (validated.video_provider !== undefined) updates.video_provider = validated.video_provider;
    if (validated.download_url !== undefined) updates.download_url = validated.download_url;

    // Check if content exists
    const { data: existing } = await client
      .from("lesson_content")
      .select("id")
      .eq("lesson_id", lessonId)
      .single();

    if (existing) {
      // Update existing
      const { data, error } = await (client.from("lesson_content") as any)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("lesson_id", lessonId)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, content: data });
    } else {
      // Create new
      const { data, error } = await (client.from("lesson_content") as any)
        .insert([
          {
            lesson_id: lessonId,
            content: validated.content || "",
            video_url: validated.video_url || null,
            video_provider: validated.video_provider || null,
            download_url: validated.download_url || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, content: data });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error updating lesson content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update lesson content" },
      { status: 500 }
    );
  }
}

