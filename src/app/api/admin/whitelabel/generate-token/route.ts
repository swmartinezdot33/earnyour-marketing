import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { generateSubaccountPITToken } from "@/lib/ghl/subaccounts";
import { z } from "zod";

const generateTokenSchema = z.object({
  locationId: z.string().min(1, "Location ID is required"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = generateTokenSchema.parse(body);

    // Generate PIT token for the subaccount
    const token = await generateSubaccountPITToken(validated.locationId);

    return NextResponse.json({ token });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error generating token:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}




