import { NextRequest, NextResponse } from "next/server";
import { validateCouponCode, applyCouponCode } from "@/lib/db/discounts";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, cartTotal, items, userId } = body;

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    if (!cartTotal || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Cart total and items are required" },
        { status: 400 }
      );
    }

    // Apply coupon code
    const result = await applyCouponCode(code, cartTotal, items);

    if (!result) {
      // Try validation to get error message
      const validation = await validateCouponCode(
        code,
        userId,
        items.find((i: any) => i.type === "course")?.id,
        items.find((i: any) => i.type === "bundle")?.id,
        cartTotal
      );

      return NextResponse.json(
        { 
          valid: false,
          error: validation.error || "Invalid coupon code"
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      discount: result.discount,
      coupon: {
        id: result.coupon.id,
        code: result.coupon.code,
        discount_type: result.coupon.discount_type,
        discount_value: result.coupon.discount_value,
      },
      newTotal: cartTotal - result.discount,
    });
  } catch (error: any) {
    console.error("Coupon validation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to validate coupon" },
      { status: 500 }
    );
  }
}

