import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/config";
import { headers } from "next/headers";
import { enrollUserInCourse } from "@/lib/db/enrollments";
import { getSupabaseClient } from "@/lib/db/courses";
import { getOrCreateUser } from "@/lib/auth";
import type { CourseBundle } from "@/lib/db/schema";

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
      
      // Support both single course (legacy) and multi-item checkout
      const courseIdsJson = session.metadata?.course_ids;
      const bundleIdsJson = session.metadata?.bundle_ids;
      const legacyCourseId = session.metadata?.course_id;
      const legacyUserId = session.metadata?.user_id;
      
      const customerEmail = session.customer_email || session.customer_details?.email;
      const customerName = session.customer_details?.name;

      if (!customerEmail) {
        console.error("No customer email in session");
        break;
      }

      try {
        // Get or create user (guest checkout support)
        const user = await getOrCreateUser(customerEmail, customerName || undefined);
        
        const supabaseClient = getSupabaseClient();
        const purchases: any[] = [];

        // Handle legacy single course checkout
        if (legacyCourseId && legacyUserId) {
          await enrollUserInCourse(user.id, legacyCourseId, session.id);
          purchases.push({
            user_id: user.id,
            course_id: legacyCourseId,
            stripe_checkout_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent,
            amount: session.amount_total ? session.amount_total / 100 : 0,
            currency: session.currency || "usd",
            status: "completed",
          });
        } else {
          // Handle multi-item checkout
          const courseIds: string[] = courseIdsJson ? JSON.parse(courseIdsJson) : [];
          const bundleIds: string[] = bundleIdsJson ? JSON.parse(bundleIdsJson) : [];

          // Enroll in all courses
          for (const courseId of courseIds) {
            try {
              await enrollUserInCourse(user.id, courseId, session.id);
              purchases.push({
                user_id: user.id,
                course_id: courseId,
                stripe_checkout_session_id: session.id,
                stripe_payment_intent_id: session.payment_intent,
                amount: 0, // Will be calculated from line items
                currency: session.currency || "usd",
                status: "completed",
              });
            } catch (error) {
              console.error(`Error enrolling in course ${courseId}:`, error);
            }
          }

          // Handle bundle enrollments (enroll in all courses in each bundle)
          for (const bundleId of bundleIds) {
            const { data: bundleData } = await supabaseClient
              .from("course_bundles")
              .select("course_ids")
              .eq("id", bundleId)
              .single();

            const bundle = bundleData as Pick<CourseBundle, "course_ids"> | null;

            if (bundle && bundle.course_ids) {
              for (const courseId of bundle.course_ids) {
                try {
                  await enrollUserInCourse(user.id, courseId, session.id);
                  purchases.push({
                    user_id: user.id,
                    course_id: courseId,
                    stripe_checkout_session_id: session.id,
                    stripe_payment_intent_id: session.payment_intent,
                    amount: 0,
                    currency: session.currency || "usd",
                    status: "completed",
                  });
                } catch (error) {
                  console.error(`Error enrolling in course ${courseId} from bundle:`, error);
                }
              }
            }
          }
        }

        // Record purchases
        if (purchases.length > 0) {
          // Calculate amount per item if we have total
          const totalAmount = session.amount_total ? session.amount_total / 100 : 0;
          const amountPerItem = purchases.length > 0 ? totalAmount / purchases.length : 0;

          for (const purchase of purchases) {
            if (purchase.amount === 0) {
              purchase.amount = amountPerItem;
            }
          }

          await (supabaseClient.from("stripe_purchases") as any).insert(purchases);
        }

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

