import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase, updateModule } from "@/lib/db/courses";
import { z } from "zod";

const updateModuleSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateModuleSchema.parse(body);

    const updates: any = {};
    if (validated.title !== undefined) updates.title = validated.title;
    if (validated.description !== undefined) updates.description = validated.description || null;

    const module = await updateModule(id, updates);

    return NextResponse.json({ success: true, module });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    
    console.error("Module update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { error } = await supabase.from("modules").delete().eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 }
    );
  }
}







