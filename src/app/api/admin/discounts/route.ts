import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllDiscounts, createDiscount } from "@/lib/db/discounts";
import { z } from "zod";

const discountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().min(0),
  applicable_to: z.enum(["course", "bundle", "all"]),
  course_id: z.string().uuid().optional().nullable(),
  bundle_id: z.string().uuid().optional().nullable(),
  min_purchase_amount: z.number().min(0).optional().nullable(),
  max_discount_amount: z.number().min(0).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  active: z.boolean().default(true),
  usage_limit: z.number().int().min(1).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("course_id");

    let discounts = await getAllDiscounts(false);
    
    // Filter by course_id if provided
    if (courseId) {
      discounts = discounts.filter(
        (d) => d.course_id === courseId || d.applicable_to === "all"
      );
    }

    return NextResponse.json({ discounts });
  } catch (error: any) {
    console.error("Error fetching discounts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch discounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = discountSchema.parse(body);

    // Convert undefined to null for database compatibility
    const discountData = {
      ...validated,
      description: validated.description ?? null,
      course_id: validated.course_id ?? null,
      bundle_id: validated.bundle_id ?? null,
      min_purchase_amount: validated.min_purchase_amount ?? null,
      max_discount_amount: validated.max_discount_amount ?? null,
      start_date: validated.start_date ?? null,
      end_date: validated.end_date ?? null,
      usage_limit: validated.usage_limit ?? null,
    };

    const discount = await createDiscount(discountData);
    return NextResponse.json({ success: true, discount });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error creating discount:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create discount" },
      { status: 500 }
    );
  }
}

