import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const settingsSchema = z.object({
  apiToken: z.string().min(1),
  locationId: z.string().min(1),
  defaultPipelineId: z.string().optional(),
  courseAutomationId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = settingsSchema.parse(body);

    // In a real implementation, save to database
    // For now, we'll just validate and return success
    // These should be stored securely (encrypted) in the database

    return NextResponse.json({
      success: true,
      message: "Settings saved (note: update .env.local for actual storage)",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.issues[0]?.message || "Validation error",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    );
  }
}




