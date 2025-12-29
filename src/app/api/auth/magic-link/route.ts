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

    // Check for required environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json(
        { 
          success: false, 
          error: "Server configuration error. Please contact support." 
        },
        { status: 500 }
      );
    }

    // Get or create user
    let user;
    try {
      user = await getOrCreateUser(email);
    } catch (userError) {
      console.error("Error getting/creating user:", userError);
      
      let errorMessage = "Failed to get or create user";
      let errorCode = null;
      
      if (userError instanceof Error) {
        errorMessage = userError.message;
        // Check for specific Supabase errors
        if (userError.message.includes("column") && userError.message.includes("does not exist")) {
          errorMessage = "Database schema error. The 'status' column may be missing. Please run migration 004_user_status.sql in Supabase.";
          errorCode = "MISSING_COLUMN";
        } else if (userError.message.includes("PGRST")) {
          errorCode = (userError as any).code;
        }
      }
      
      // Always return error details in production for debugging
      const errorDetails = userError instanceof Error ? {
        message: userError.message,
        code: (userError as any).code || null,
        hint: (userError as any).hint || null,
        details: (userError as any).details || null,
      } : { message: String(userError) };

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          code: errorCode,
          details: errorDetails,
        },
        { status: 500 }
      );
    }

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
    
    // Provide more detailed error information
    let errorMessage = "Failed to send magic link";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for common Supabase errors
      if (error.message.includes("Supabase credentials")) {
        errorMessage = "Server configuration error. Supabase credentials are missing.";
      } else if (error.message.includes("relation") || error.message.includes("does not exist")) {
        errorMessage = "Database error. Please ensure all tables are created in Supabase.";
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : String(error)) : undefined,
      },
      { status: 500 }
    );
  }
}
