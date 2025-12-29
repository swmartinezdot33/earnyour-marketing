import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createSession } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import { getOrCreateUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Supabase can send tokens as query params or hash fragments
    // Check query params first
    let token = searchParams.get("token") || searchParams.get("access_token");
    let type = searchParams.get("type");
    
    // If no token in query, check hash fragment (Supabase client-side auth)
    if (!token && url.hash) {
      const hashParams = new URLSearchParams(url.hash.substring(1));
      token = hashParams.get("access_token");
      type = hashParams.get("type") || "magiclink";
    }

    if (!token) {
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

    // If we have an access_token from hash fragment, exchange it for user
    let user;
    if (token.startsWith("eyJ")) {
      // This is a JWT access token, not an OTP token
      // Get user from the token
      const { data: { user: tokenUser }, error: userError } = await supabaseAdmin.auth.getUser(token);
      
      if (userError || !tokenUser) {
        console.error("Token user error:", userError);
        return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
      }
      
      user = tokenUser;
    } else {
      // This is an OTP token hash, verify it
      const { data: otpData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
        token_hash: token,
        type: type === "magiclink" ? "magiclink" : "email",
      });

      if (otpError || !otpData.user) {
        console.error("Token verification error:", otpError);
        return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
      }

      user = otpData.user;
    }


    if (!user.email) {
      console.error("User email is missing");
      return NextResponse.redirect(new URL("/login?error=missing_email", request.url));
    }

    // Ensure user exists in our users table and get role
    let dbUser;
    try {
      dbUser = await getOrCreateUser(user.email);
    } catch (userError) {
      console.error("Error getting/creating user:", userError);
      // Fallback: try to get existing user
      const client = getSupabaseClient();
      const { data: existingUser } = await client
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single();
      
      dbUser = existingUser || { role: "student" };
    }

    const role = (dbUser?.role as "admin" | "student") || "student";

    // Create session in our system
    await createSession(user.id, user.email, role);

    // Redirect to dashboard
    const redirectUrl = role === "admin" ? "/admin/courses" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Auth callback error:", error);
    return NextResponse.redirect(new URL("/login?error=callback_failed", request.url));
  }
}

