import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getCouponCodeById, updateCouponCode } from "@/lib/db/discounts";
import { z } from "zod";

const updateCouponSchema = z.object({
  code: z.string().min(1).max(50).optional(),
  description: z.string().optional().nullable(),
  discount_type: z.enum(["percentage", "fixed_amount"]).optional(),
  discount_value: z.number().min(0).optional(),
  applicable_to: z.enum(["course", "bundle", "all", "cart"]).optional(),
  course_id: z.string().uuid().optional().nullable(),
  bundle_id: z.string().uuid().optional().nullable(),
  min_cart_amount: z.number().min(0).optional().nullable(),
  max_discount_amount: z.number().min(0).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  active: z.boolean().optional(),
  usage_limit: z.number().int().min(1).optional().nullable(),
  user_limit: z.number().int().min(1).optional().nullable(),
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

    const { id } = await params;
    const coupon = await getCouponCodeById(id);
    return NextResponse.json({ coupon });
  } catch (error: any) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch coupon" },
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

    const { id } = await params;
    const body = await request.json();
    const validated = updateCouponSchema.parse(body);

    const coupon = await updateCouponCode(id, validated);
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update coupon" },
      { status: 500 }
    );
  }
}

