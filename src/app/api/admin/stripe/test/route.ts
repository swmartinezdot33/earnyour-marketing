import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getStripeClient } from "@/lib/stripe/config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({
        success: false,
        message: "Stripe secret key is not configured. Please add STRIPE_SECRET_KEY to your environment variables.",
      });
    }

    try {
      const stripe = getStripeClient();
      // Test connection by retrieving account info
      const account = await stripe.accounts.retrieve();
      
      return NextResponse.json({
        success: true,
        message: `Successfully connected to Stripe${account.business_profile?.name ? ` (${account.business_profile.name})` : ""}`,
        accountId: account.id,
      });
    } catch (error: any) {
      return NextResponse.json({
        success: false,
        message: error.message || "Failed to connect to Stripe. Please check your API key.",
      });
    }
  } catch (error) {
    console.error("Stripe test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while testing Stripe connection",
      },
      { status: 500 }
    );
  }
}




