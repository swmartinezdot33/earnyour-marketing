import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db/courses";
import { createSession } from "@/lib/auth";

/**
 * Setup endpoint to create an admin user for initial production setup
 * This should be protected or removed after initial setup
 * 
 * Usage: POST /api/admin/setup
 * Body: { email: "admin@example.com", name: "Admin User" }
 */
export async function POST(request: NextRequest) {
  try {
    // In production, you might want to add additional security here
    // For example, check for a setup token or restrict to first-time setup
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await client
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase())
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    let userId: string;

    if (existingUser) {
      // Update existing user to admin
      const { data: updatedUser, error: updateError } = await client
        .from("users")
        .update({ role: "admin" as const })
        .eq("id", existingUser.id)
        .select()
        .single();

      if (updateError) throw updateError;
      userId = updatedUser.id;
    } else {
      // Create new admin user
      const { data: newUser, error: createError } = await (client.from("users") as any)
        .insert([
          {
            email: email.toLowerCase(),
            name: name || null,
            role: "admin",
            status: "active",
          },
        ])
        .select()
        .single();

      if (createError) throw createError;
      userId = newUser.id;
    }

    // Create a session token for immediate login
    const sessionToken = await createSession(userId, email.toLowerCase(), "admin");

    return NextResponse.json({
      success: true,
      message: existingUser
        ? "User updated to admin role"
        : "Admin user created successfully",
      userId,
      email: email.toLowerCase(),
      sessionToken, // In production, you might not want to return this
    });
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to setup admin user",
      },
      { status: 500 }
    );
  }
}

