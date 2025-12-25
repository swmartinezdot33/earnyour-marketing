import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getOrCreateUser, createSession } from "@/lib/auth";
import { z } from "zod";

// Only initialize Resend if API key is provided
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const requestSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    // Get or create user
    const user = await getOrCreateUser(email);

    // Generate magic link token
    const token = await createSession(user.id, user.email, user.role || "student");
    const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify?token=${token}`;

    // In development, log the link and return it in the response
    const isDevelopment = process.env.NODE_ENV === "development";
    
    if (isDevelopment) {
      console.log("\n🔗 Magic Link (Development Mode):");
      console.log(magicLink);
      console.log("\n");
    }

    // Send email (only if RESEND_API_KEY is set)
    if (resend && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: "EarnYour <onboarding@resend.dev>",
          to: email,
          subject: "Your Login Link",
          html: `
            <h1>Welcome to EarnYour Courses</h1>
            <p>Click the link below to log in:</p>
            <p><a href="${magicLink}" style="background: #EB7030; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Log In</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, you can safely ignore this email.</p>
          `,
        });
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't fail if email fails in development
        if (!isDevelopment) throw emailError;
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: isDevelopment && !process.env.RESEND_API_KEY
        ? "Magic link generated (check server console)"
        : "Check your email for a login link",
      // Return link in development mode for easier testing
      ...(isDevelopment && { magicLink })
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    
    console.error("Magic link error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}

