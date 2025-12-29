import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { 
          success: false, 
          error: "Server configuration error. Supabase credentials are missing." 
        },
        { status: 500 }
      );
    }

    // Use Supabase's built-in magic link authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Determine redirect URL after login
    const redirectUrl = process.env.NEXT_PUBLIC_APP_URL || 
                        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                        "http://localhost:3000";
    
    const redirectTo = `${redirectUrl}/api/auth/callback`;

    // Send magic link using Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.status || null,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Check your email for a login link",
    });
  } catch (error) {
    console.error("Magic link error:", error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send magic link",
        details: process.env.NODE_ENV === "development" 
          ? (error instanceof Error ? error.stack : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}
