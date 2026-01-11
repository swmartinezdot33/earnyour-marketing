import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCourse } from "@/lib/db/courses";
import { getSupabaseClient } from "@/lib/db/courses";
import { z } from "zod";

const linkSchema = z.object({
  stripe_product_id: z.string().min(1),
  stripe_price_id: z.string().min(1),
});

export const dynamic = "force-dynamic";

export async function POST(
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
    const validated = linkSchema.parse(body);

    // Update course with Stripe IDs
    const course = await updateCourse(id, {
      stripe_product_id: validated.stripe_product_id,
      stripe_price_id: validated.stripe_price_id,
    });

    // Ensure stripe_products table entry exists
    const client = getSupabaseClient();
    const { data: existing } = await client
      .from("stripe_products")
      .select("id")
      .eq("course_id", id)
      .single();

    if (existing) {
      // Update existing entry
      await (client.from("stripe_products") as any)
        .update({
          stripe_product_id: validated.stripe_product_id,
          stripe_price_id: validated.stripe_price_id,
        })
        .eq("course_id", id);
    } else {
      // Create new entry
      await (client.from("stripe_products") as any).insert([
        {
          course_id: id,
          stripe_product_id: validated.stripe_product_id,
          stripe_price_id: validated.stripe_price_id,
        },
      ]);
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Stripe link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to link Stripe product" },
      { status: 500 }
    );
  }
}




