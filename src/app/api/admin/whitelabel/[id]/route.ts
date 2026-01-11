import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getWhitelabelAccountById,
  updateWhitelabelAccount,
  deleteWhitelabelAccount,
} from "@/lib/db/whitelabel";
import { z } from "zod";

const updateWhitelabelSchema = z.object({
  name: z.string().min(1).optional(),
  ghlLocationId: z.string().min(1).optional(),
  ghlApiToken: z.string().min(1).optional(),
  branding: z
    .object({
      logo: z.string().url().optional(),
      primaryColor: z.string().optional(),
      secondaryColor: z.string().optional(),
    })
    .optional(),
  status: z.enum(["active", "suspended", "pending"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const account = await getWhitelabelAccountById(id);

    if (!account) {
      return NextResponse.json(
        { error: "Whitelabel account not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error("Error getting whitelabel account:", error);
    return NextResponse.json(
      { error: "Failed to get whitelabel account" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const validated = updateWhitelabelSchema.parse(body);

    const account = await updateWhitelabelAccount(id, validated);

    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    console.error("Error updating whitelabel account:", error);
    return NextResponse.json(
      { error: "Failed to update whitelabel account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteWhitelabelAccount(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting whitelabel account:", error);
    return NextResponse.json(
      { error: "Failed to delete whitelabel account" },
      { status: 500 }
    );
  }
}










