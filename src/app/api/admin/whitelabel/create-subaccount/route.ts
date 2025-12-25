import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createGHLSubaccount, generateSubaccountPITToken } from "@/lib/ghl/subaccounts";
import { createWhitelabelAccount } from "@/lib/db/whitelabel";
import { z } from "zod";

const createSubaccountSchema = z.object({
  name: z.string().min(1),
  companyName: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
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
    const validated = createSubaccountSchema.parse(body);

    // Step 1: Create the GHL subaccount
    const subaccountData = {
      name: validated.name,
      companyName: validated.companyName,
      email: validated.email || undefined,
      phone: validated.phone,
      website: validated.website || undefined,
    };

    const ghlSubaccount = await createGHLSubaccount(subaccountData);

    if (!ghlSubaccount.id) {
      throw new Error("Failed to create GHL subaccount: No location ID returned");
    }

    // Step 2: Generate a PIT token for the subaccount
    const pitToken = await generateSubaccountPITToken(
      ghlSubaccount.id,
      `EarnYour App - ${validated.name}`
    );

    if (!pitToken) {
      throw new Error("Failed to generate PIT token for subaccount");
    }

    // Step 3: Create the whitelabel account in our database
    const whitelabel = await createWhitelabelAccount(session.userId, {
      name: validated.name,
      ghlLocationId: ghlSubaccount.id,
      ghlApiToken: pitToken,
      branding: validated.branding,
    });

    return NextResponse.json({
      ...whitelabel,
      ghlSubaccount: {
        id: ghlSubaccount.id,
        name: ghlSubaccount.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error creating subaccount:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to create subaccount",
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}




