import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  assignUserToWhitelabel,
  removeUserFromWhitelabel,
} from "@/lib/db/whitelabel";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, userId } = await params;
    const assignment = await assignUserToWhitelabel(userId, id);

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error assigning user to whitelabel:", error);
    return NextResponse.json(
      { error: "Failed to assign user to whitelabel" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, userId } = await params;
    await removeUserFromWhitelabel(userId, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing user from whitelabel:", error);
    return NextResponse.json(
      { error: "Failed to remove user from whitelabel" },
      { status: 500 }
    );
  }
}







