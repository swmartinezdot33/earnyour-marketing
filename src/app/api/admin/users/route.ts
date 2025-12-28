import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createUser } from "@/lib/db/users";
import { z } from "zod";

const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().optional().nullable(),
  role: z.enum(["admin", "student"]).default("student"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = createUserSchema.parse(body);

    // Create user
    const user = await createUser({
      email: validated.email.toLowerCase(),
      name: validated.name || null,
      role: validated.role,
      status: "active",
      ghl_contact_id: null,
      ghl_location_id: null,
      whitelabel_id: null,
      deleted_at: null,
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getAllUsers } = await import("@/lib/db/users-admin");
    const users = await getAllUsers(false); // Exclude deleted

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get users" },
      { status: 500 }
    );
  }
}






