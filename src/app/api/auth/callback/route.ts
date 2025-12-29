import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const type = searchParams.get("type");

    if (!token || type !== "magiclink") {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    // Exchange the token for a session using Supabase Admin API
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verify the token and get user
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    // If that doesn't work, try verifying the OTP
    if (error || !user) {
      const { data: otpData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: "magiclink",
      });
      
      if (otpError || !otpData.user) {
        console.error("Token verification error:", otpError || error);
        return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
      }
      
      user = otpData.user;
    }

    if (error || !user) {
      console.error("Token verification error:", error);
      return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
    }

    // Get user role from our users table
    const client = getSupabaseClient();
    const { data: userData } = await client
      .from("users")
      .select("role")
      .eq("email", user.email)
      .single();

    const role = (userData?.role as "admin" | "student") || "student";

    // Create session in our system
    await createSession(user.id, user.email!, role);

    // Redirect to dashboard
    const redirectUrl = role === "admin" ? "/admin/courses" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }
}

