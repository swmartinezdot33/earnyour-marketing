import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getUserById, updateUser } from "@/lib/db/users";
import { getSupabaseClient } from "@/lib/db/courses";
import { getGHLClientForUser } from "@/lib/ghl/user-location";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Soft delete: Set status to 'deleted' and deleted_at timestamp
    await updateUser(session.userId, {
      status: "deleted",
      deleted_at: new Date().toISOString(),
    });

    // Delete from GHL if contact exists
    if (user.ghl_contact_id) {
      try {
        const client = await getGHLClientForUser(user.id);
        await client.deleteContact(user.ghl_contact_id);
      } catch (ghlError) {
        console.error("Error deleting contact from GHL:", ghlError);
        // Don't fail the account deletion if GHL deletion fails
      }
    }

    // Cancel any active Stripe subscriptions (if subscriptions are implemented)
    // This would require Stripe subscription management
    // For now, we'll skip this as courses are one-time purchases

    // Delete session cookie
    const { deleteSession } = await import("@/lib/auth");
    await deleteSession();

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}




