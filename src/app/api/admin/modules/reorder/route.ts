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
    const { modules } = body;

    // Update order for each module
    const client = getSupabaseClient();
    for (const module of modules) {
      await (client.from("modules") as any)
        .update({ order: module.order, updated_at: new Date().toISOString() })
        .eq("id", module.id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to reorder modules" },
      { status: 500 }
    );
  }
}

