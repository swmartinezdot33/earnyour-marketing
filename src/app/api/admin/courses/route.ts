import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createCourse, getSupabaseClient } from "@/lib/db/courses";
import { createStripeProduct } from "@/lib/stripe/products";
import { z } from "zod";

const courseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  short_description: z.string().optional(),
  price: z.number().min(0),
  image_url: z.string().url().optional().or(z.literal("")),
  stripe_product_id: z.string().optional(),
  stripe_price_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = courseSchema.parse(body);

    // Create course in database
    const course = await createCourse({
      ...validated,
      description: validated.description || null,
      short_description: validated.short_description || null,
      created_by: session.userId,
      published: false,
      image_url: validated.image_url || null,
      stripe_product_id: validated.stripe_product_id || null,
      stripe_price_id: validated.stripe_price_id || null,
    });

    if (validated.stripe_product_id) {
      // Link existing Stripe product
      const client = getSupabaseClient();
      await (client.from("stripe_products") as any).insert([
        {
          course_id: course.id,
          stripe_product_id: validated.stripe_product_id,
          stripe_price_id: validated.stripe_price_id || null,
        },
      ]);
    } else {
      // Create new Stripe product
      try {
        await createStripeProduct(course);
      } catch (stripeError) {
        console.error("Stripe product creation failed:", stripeError);
        // Continue even if Stripe fails - can be fixed later
      }
    }

    return NextResponse.json({ success: true, course });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    
    console.error("Course creation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create course" },
      { status: 500 }
    );
  }
}

