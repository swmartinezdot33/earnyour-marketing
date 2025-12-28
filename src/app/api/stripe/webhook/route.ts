import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/config";
import { headers } from "next/headers";
import { enrollUserInCourse } from "@/lib/db/enrollments";
import { getSupabaseClient } from "@/lib/db/courses";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const stripe = getStripeClient();
  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as any;
      
      const courseId = session.metadata?.course_id;
      const userId = session.metadata?.user_id;
      const customerEmail = session.customer_email || session.customer_details?.email;

      if (!courseId || !userId) {
        console.error("Missing course_id or user_id in session metadata");
        break;
      }

      try {
        // Enroll user in course
        await enrollUserInCourse(userId, courseId, session.id);

        // Record purchase
        const supabaseClient = getSupabaseClient();
        await (supabaseClient.from("stripe_purchases") as any).insert([
          {
            user_id: userId,
            course_id: courseId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            status: "completed",
          },
        ]).select().single();

      } catch (error) {
        console.error("Error processing enrollment:", error);
        // Return 500 so Stripe retries
        return NextResponse.json(
          { error: "Failed to process enrollment" },
          { status: 500 }
        );
      }
      break;
    }

    case "payment_intent.succeeded": {
      // Handle successful payment
      break;
    }

    case "payment_intent.payment_failed": {
      // Handle failed payment
      const paymentIntent = event.data.object as any;
        const supabaseClient = getSupabaseClient();
        await (supabaseClient.from("stripe_purchases") as any)
          .update({ status: "failed" })
          .eq("stripe_payment_intent_id", paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

