import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAllCouponCodes, createCouponCode } from "@/lib/db/discounts";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  description: z.string().optional(),
  discount_type: z.enum(["percentage", "fixed_amount"]),
  discount_value: z.number().min(0),
  applicable_to: z.enum(["course", "bundle", "all", "cart"]),
  course_id: z.string().uuid().optional().nullable(),
  bundle_id: z.string().uuid().optional().nullable(),
  min_cart_amount: z.number().min(0).optional().nullable(),
  max_discount_amount: z.number().min(0).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  active: z.boolean().default(true),
  usage_limit: z.number().int().min(1).optional().nullable(),
  user_limit: z.number().int().min(1).optional().nullable(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupons = await getAllCouponCodes(false);
    return NextResponse.json({ coupons });
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupons" },
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
    const validated = couponSchema.parse(body);

    // Convert undefined to null for database compatibility
    const couponData = {
      ...validated,
      description: validated.description ?? null,
      course_id: validated.course_id ?? null,
      bundle_id: validated.bundle_id ?? null,
      min_cart_amount: validated.min_cart_amount ?? null,
      max_discount_amount: validated.max_discount_amount ?? null,
      start_date: validated.start_date ?? null,
      end_date: validated.end_date ?? null,
      usage_limit: validated.usage_limit ?? null,
      user_limit: validated.user_limit ?? null,
    };

    const coupon = await createCouponCode(couponData);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create coupon" },
      { status: 500 }
    );
  }
}

