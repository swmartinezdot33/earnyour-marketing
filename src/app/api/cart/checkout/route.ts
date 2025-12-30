import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/config";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Course, CourseBundle } from "@/lib/db/schema";

interface CheckoutItem {
  type: "course" | "bundle";
  id: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, email } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items are required" },
        { status: 400 }
      );
    }

    const stripe = getStripeClient();
    const supabase = getSupabaseClient();

    // Fetch all course and bundle data
    const lineItems: any[] = [];
    const courseIds: string[] = [];
    const bundleIds: string[] = [];

    for (const item of items as CheckoutItem[]) {
      if (item.type === "course") {
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .eq("id", item.id)
          .single();

        const course = courseData as Course | null;

        if (!course || !course.stripe_price_id) {
          return NextResponse.json(
            { error: `Course ${item.id} not found or not configured for Stripe` },
            { status: 400 }
          );
        }

        lineItems.push({
          price: course.stripe_price_id,
          quantity: 1,
        });
        courseIds.push(item.id);
      } else if (item.type === "bundle") {
        const { data: bundleData } = await supabase
          .from("course_bundles")
          .select("*")
          .eq("id", item.id)
          .single();

        const bundle = bundleData as CourseBundle | null;

        if (!bundle || !bundle.stripe_price_id) {
          return NextResponse.json(
            { error: `Bundle ${item.id} not found or not configured for Stripe` },
            { status: 400 }
          );
        }

        lineItems.push({
          price: bundle.stripe_price_id,
          quantity: 1,
        });
        bundleIds.push(item.id);
      }
    }

    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items to checkout" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const successUrl = `${baseUrl}/store/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/store`;

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email || undefined,
      metadata: {
        course_ids: JSON.stringify(courseIds),
        bundle_ids: JSON.stringify(bundleIds),
        item_count: items.length.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}

