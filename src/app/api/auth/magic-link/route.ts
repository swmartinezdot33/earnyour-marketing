import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/db/courses";
import { SignJWT } from "jose";

const secretKey = process.env.MAGIC_LINK_SECRET || "fallback-secret-key-change-in-production";
const key = new TextEncoder().encode(secretKey);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400 }
      );
    }

    // Get or create user
    const user = await getOrCreateUser(email);

    // Generate magic link token
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role || "student",
      expiresAt,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(key);

    // Determine base URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
                    "http://localhost:3000";
    
    const magicLink = `${baseUrl}/api/auth/verify?token=${token}`;

    const isDevelopment = process.env.NODE_ENV === "development";
    
    // In development, log the link
    if (isDevelopment) {
      console.log("\n🔗 Magic Link (Development Mode):");
      console.log(magicLink);
      console.log("\n");
    }

    // Send email if RESEND_API_KEY is set
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "EarnYour <onboarding@resend.dev>",
          to: email,
          subject: "Your Login Link - EarnYour",
          html: `
            <h1>Welcome to EarnYour Courses</h1>
            <p>Click the link below to sign in:</p>
            <a href="${magicLink}" style="display: inline-block; padding: 12px 24px; background-color: #EB7030; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Sign In
            </a>
            <p>This link expires in 24 hours.</p>
            <p>If you didn't request this link, you can safely ignore this email.</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Or copy and paste: ${magicLink}</p>
          `,
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // In development, don't fail - return the link
        if (!isDevelopment) {
          // In production, still return success but log error
          console.error("Email failed but continuing...");
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: process.env.RESEND_API_KEY
        ? "Check your email for a login link"
        : `Magic link: ${magicLink}`,
      // Return link in development or if email is not configured
      magicLink: (!process.env.RESEND_API_KEY || isDevelopment) ? magicLink : undefined,
    });
  } catch (error) {
    console.error("Magic link error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send magic link",
      },
      { status: 500 }
    );
  }
}
