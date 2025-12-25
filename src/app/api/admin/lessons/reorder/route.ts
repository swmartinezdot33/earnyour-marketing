import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { lessons } = body;

    // Update order for each lesson
    const client = getSupabaseClient();
    for (const lesson of lessons) {
      await (client.from("lessons") as any)
        .update({ order: lesson.order, updated_at: new Date().toISOString() })
        .eq("id", lesson.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reorder lessons" },
      { status: 500 }
    );
  }
}

