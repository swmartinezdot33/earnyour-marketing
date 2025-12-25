import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";
import { createSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
    }

    const payload = await decrypt(token);
    
    if (!payload || payload.expiresAt < Date.now()) {
      return NextResponse.redirect(new URL("/login?error=expired_token", request.url));
    }

    // Create new session
    await createSession(payload.userId, payload.email, payload.role);

    // Redirect to dashboard
    const redirectUrl = payload.role === "admin" ? "/admin/courses" : "/dashboard";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.redirect(new URL("/login?error=verification_failed", request.url));
  }
}




