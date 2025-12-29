import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateCourse } from "@/lib/db/courses";
import { getSupabaseClient } from "@/lib/db/courses";

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

    // Update course to remove Stripe IDs
    const course = await updateCourse(id, {
      stripe_product_id: null,
      stripe_price_id: null,
    });

    // Note: We don't delete from stripe_products table to keep history
    // But we could if needed:
    // const client = getSupabaseClient();
    // await client.from("stripe_products").delete().eq("course_id", id);

    return NextResponse.json({ success: true, course });
  } catch (error) {
    console.error("Stripe unlink error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to unlink Stripe product" },
      { status: 500 }
    );
  }
}

