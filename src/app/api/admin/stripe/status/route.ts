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

    const isConfigured = !!process.env.STRIPE_SECRET_KEY;
    const isTestMode = isConfigured && process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_");

    let accountInfo = null;
    if (isConfigured) {
      try {
        const stripe = getStripeClient();
        const account = await stripe.accounts.retrieve();
        accountInfo = {
          accountId: account.id,
          accountName: account.business_profile?.name || account.email || "Stripe Account",
        };
      } catch (error) {
        // If we can't retrieve account, still show as configured
        console.error("Error retrieving Stripe account:", error);
      }
    }

    return NextResponse.json({
      configured: isConfigured,
      testMode: isTestMode,
      ...accountInfo,
    });
  } catch (error) {
    console.error("Stripe status check error:", error);
    return NextResponse.json(
      {
        configured: false,
        testMode: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}




