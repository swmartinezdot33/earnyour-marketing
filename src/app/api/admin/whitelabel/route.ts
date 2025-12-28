import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createWhitelabelAccount } from "@/lib/db/whitelabel";
import { z } from "zod";

const createWhitelabelSchema = z.object({
  name: z.string().min(1),
  ghlLocationId: z.string().min(1),
  ghlApiToken: z.string().min(1),
  branding: z
    .object({
      logo: z.string().url().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createWhitelabelSchema.parse(body);

    const whitelabel = await createWhitelabelAccount(session.userId, {
      name: validated.name,
      ghlLocationId: validated.ghlLocationId,
      ghlApiToken: validated.ghlApiToken,
      branding: validated.branding,
    });

    return NextResponse.json(whitelabel);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error creating whitelabel account:", error);
    return NextResponse.json(
      { error: "Failed to create whitelabel account" },
      { status: 500 }
    );
  }
}







