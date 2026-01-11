import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db/courses";

export async function GET(request: NextRequest) {
  try {
    // Check environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        success: false,
        error: "Missing environment variables",
        details: {
          hasUrl,
          hasKey,
          urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "...",
        },
      }, { status: 500 });
    }

    // Test Supabase connection
    const client = getSupabaseClient();
    
    // Try to query users table
    const { data, error } = await client
      .from("users")
      .select("count")
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: "Supabase connection failed",
        details: {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details,
        },
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      details: {
        hasUrl,
        hasKey,
        canQueryUsers: true,
      },
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      details: process.env.NODE_ENV === "development" 
        ? (error instanceof Error ? error.stack : String(error))
        : undefined,
    }, { status: 500 });
  }
}




