import Stripe from "stripe";

// Lazy initialization - only create Stripe client when needed
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set. Stripe features are disabled.");
    }
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover" as const,
      typescript: true,
    });
  }
  return stripeClient;
}

// Export for backward compatibility - will throw if STRIPE_SECRET_KEY is not set when accessed
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as Stripe;

