import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateUser, getUserById } from "@/lib/db/users";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).optional().nullable(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "student"]).optional(),
  status: z.enum(["active", "suspended", "deleted"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = await getUserById(id);

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const validated = updateUserSchema.parse(body);

    // If email is being updated, check if it's already taken
    if (validated.email) {
      const { getUserByEmail } = await import("@/lib/db/users");
      const existingUser = await getUserByEmail(validated.email);
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json(
          { success: false, error: "Email already in use" },
          { status: 400 }
        );
      }
    }

    // Prepare updates
    const updates: any = {};
    if (validated.name !== undefined) updates.name = validated.name;
    if (validated.email !== undefined) updates.email = validated.email.toLowerCase();
    if (validated.role !== undefined) updates.role = validated.role;
    if (validated.status !== undefined) {
      updates.status = validated.status;
      // If status is deleted, set deleted_at; otherwise clear it
      if (validated.status === "deleted") {
        updates.deleted_at = new Date().toISOString();
      } else {
        updates.deleted_at = null;
      }
    }

    const updatedUser = await updateUser(id, updates);

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }
    
    console.error("User update error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    );
  }
}




