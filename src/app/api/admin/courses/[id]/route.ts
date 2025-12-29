import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase } from "@/lib/db/courses";
import { updateCourse } from "@/lib/db/courses";
import { z } from "zod";

const updateCourseSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  short_description: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  image_url: z.string().url().optional().nullable().or(z.literal("")),
  published: z.boolean().optional(),
  stripe_product_id: z.string().optional().nullable(),
  stripe_price_id: z.string().optional().nullable(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, course: data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch course" },
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
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateCourseSchema.parse(body);

    const updates: any = {};
    if (validated.title !== undefined) updates.title = validated.title;
    if (validated.slug !== undefined) updates.slug = validated.slug;
    if (validated.description !== undefined) updates.description = validated.description || null;
    if (validated.short_description !== undefined) updates.short_description = validated.short_description || null;
    if (validated.price !== undefined) updates.price = validated.price;
    if (validated.image_url !== undefined) updates.image_url = validated.image_url || null;
    if (validated.published !== undefined) updates.published = validated.published;
    if (validated.stripe_product_id !== undefined) updates.stripe_product_id = validated.stripe_product_id || null;
    if (validated.stripe_price_id !== undefined) updates.stripe_price_id = validated.stripe_price_id || null;

    const course = await updateCourse(id, updates);

    return NextResponse.json({ success: true, course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    
    console.error("Course update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}






