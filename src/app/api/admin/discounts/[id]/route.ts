import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDiscountById, updateDiscount } from "@/lib/db/discounts";
import { z } from "zod";

const updateDiscountSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  discount_type: z.enum(["percentage", "fixed_amount"]).optional(),
  discount_value: z.number().min(0).optional(),
  applicable_to: z.enum(["course", "bundle", "all"]).optional(),
  course_id: z.string().uuid().optional().nullable(),
  bundle_id: z.string().uuid().optional().nullable(),
  min_purchase_amount: z.number().min(0).optional().nullable(),
  max_discount_amount: z.number().min(0).optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  active: z.boolean().optional(),
  usage_limit: z.number().int().min(1).optional().nullable(),
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
    const discount = await getDiscountById(id);
    return NextResponse.json({ discount });
  } catch (error: any) {
    console.error("Error fetching discount:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch discount" },
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
    const validated = updateDiscountSchema.parse(body);

    const discount = await updateDiscount(id, validated);
    return NextResponse.json({ success: true, discount });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error updating discount:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update discount" },
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
    const { deleteDiscount } = await import("@/lib/db/discounts");
    await deleteDiscount(id);

    return NextResponse.json({ success: true, message: "Discount deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting discount:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete discount" },
      { status: 500 }
    );
  }
}

