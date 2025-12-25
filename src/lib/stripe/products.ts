import { getStripeClient } from "./config";
import { createCourse, updateCourse } from "@/lib/db/courses";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Course } from "@/lib/db/schema";

export async function createStripeProduct(course: Course) {
  // Skip Stripe if not configured
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe not configured, skipping product creation");
    return null;
  }
  
  const stripe = getStripeClient();
  // Create product in Stripe
  const product = await stripe.products.create({
    name: course.title,
    description: course.short_description || course.description || undefined,
    images: course.image_url ? [course.image_url] : undefined,
    metadata: {
      course_id: course.id,
    },
  });

  // Create price
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: Math.round(course.price * 100), // Convert to cents
    currency: "usd",
  });

  // Save to database
  const client = getSupabaseClient();
  await (client.from("stripe_products") as any).insert([
    {
      course_id: course.id,
      stripe_product_id: product.id,
      stripe_price_id: price.id,
    },
  ]);

  // Update course with Stripe IDs
  await updateCourse(course.id, {
    stripe_product_id: product.id,
    stripe_price_id: price.id,
  });

  return { product, price };
}

export async function updateStripeProduct(course: Course) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("Stripe not configured, skipping product update");
    return null;
  }
  
  if (!course.stripe_product_id) {
    return createStripeProduct(course);
  }

  const stripe = getStripeClient();
  // Update product
  await stripe.products.update(course.stripe_product_id, {
    name: course.title,
    description: course.short_description || course.description || undefined,
    images: course.image_url ? [course.image_url] : undefined,
  });

  // If price changed, create new price
  const client = getSupabaseClient();
  const { data: stripeProduct } = await client
    .from("stripe_products")
    .select("stripe_price_id")
    .eq("course_id", course.id)
    .single();

  if (stripeProduct) {
    const currentPrice = await stripe.prices.retrieve((stripeProduct as any).stripe_price_id);
    const currentAmount = currentPrice.unit_amount ? currentPrice.unit_amount / 100 : 0;

    if (currentAmount !== course.price) {
      // Create new price
      const newPrice = await stripe.prices.create({
        product: course.stripe_product_id,
        unit_amount: Math.round(course.price * 100),
        currency: "usd",
      });

      // Update database
      await (client.from("stripe_products") as any)
        .update({ stripe_price_id: newPrice.id })
        .eq("course_id", course.id);

      await updateCourse(course.id, {
        stripe_price_id: newPrice.id,
      });

      // Archive old price
      await stripe.prices.update((stripeProduct as any).stripe_price_id, {
        active: false,
      });
    }
  }
}

export async function createCheckoutSession(
  courseId: string,
  userId: string,
  userEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured");
  }
  
  const stripe = getStripeClient();
  const client = getSupabaseClient();
  const { data: courseData } = await client
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!courseData || !(courseData as any).stripe_price_id) {
    throw new Error("Course not found or not configured for Stripe");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: (courseData as any).stripe_price_id,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail,
    metadata: {
      course_id: courseId,
      user_id: userId,
    },
  });

  return session;
}

