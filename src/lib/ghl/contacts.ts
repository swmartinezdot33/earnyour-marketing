import { ghlClient } from "./client";
import { findContactByEmail, getUserById } from "@/lib/db/users";
import { getUserGHLLocationId, getUserGHLLocationIdByEmail, getGHLClientForUser } from "./user-location";
import { GHLClient } from "./client";

export async function tagContactInGHL(
  email: string,
  tagName: string,
  action: "enrolled" | "completed"
) {
  try {
    // Get the appropriate GHL location for this user
    const locationId = await getUserGHLLocationIdByEmail(email);
    
    // Get user from our database to determine which client to use
    const user = await findContactByEmail(email);
    const client = user ? await getGHLClientForUser(user.id) : ghlClient;
    
    // Find or create contact in GHL
    let contact = await client.findContactByEmail(email);
    
    if (!contact) {
      if (user) {
        contact = await client.createOrUpdateContact({
          email: user.email,
          name: user.name || undefined,
        });
      } else {
        // Create minimal contact
        contact = await client.createOrUpdateContact({
          email,
        });
      }
    }

    if (!contact || !contact.id) {
      throw new Error("Failed to create or find contact");
    }

    // Add tag
    await client.addTagsToContact(contact.id, [tagName]);

    // Add action-specific tag
    const actionTag = action === "enrolled" ? "Course Enrolled" : "Course Completed";
    await client.addTagsToContact(contact.id, [actionTag]);

    // Update user's GHL contact ID and location if we have the user
    if (user) {
      const { getSupabaseClient } = await import("@/lib/db/courses");
      const supabase = getSupabaseClient();
      await (supabase.from("users") as any)
        .update({
          ghl_contact_id: contact.id,
          ghl_location_id: locationId,
        })
        .eq("id", user.id);
    }

    return contact;
  } catch (error) {
    console.error("Error tagging contact in GHL:", error);
    throw error;
  }
}

/**
 * Sync user to GHL
 * 
 * IMPORTANT: Regular users are ALWAYS created in the default location (GQOh2EMzgc3bRAfN7Q9j)
 * for courses, memberships, and marketing. We only use whitelabel subaccounts when
 * someone has purchased the whitelabel SaaS GHL product.
 * 
 * - Whitelabel SaaS customers (with whitelabel_id): Creates contact in whitelabel's subaccount
 * - Regular users (no whitelabel_id): Creates contact in default location (GQOh2EMzgc3bRAfN7Q9j)
 *   Regular users are just contacts, not subaccounts
 */
export async function syncUserToGHL(userId: string) {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Get the appropriate GHL client for this user
    // Regular users ALWAYS use default location for courses, memberships, marketing
    // Only whitelabel SaaS customers use their own subaccount
    const client = await getGHLClientForUser(userId);
    const locationId = await getUserGHLLocationId(userId);

    // Create or update contact in GHL
    // Regular users: Creates contact in default location (GQOh2EMzgc3bRAfN7Q9j)
    // Whitelabel SaaS customers: Creates contact in their whitelabel subaccount
    const contact = await client.createOrUpdateContact({
      email: user.email,
      name: user.name || undefined,
    });

    // Update user record with GHL contact ID and location
    // Regular users: ghl_location_id = GQOh2EMzgc3bRAfN7Q9j (default location)
    // Whitelabel SaaS customers: ghl_location_id = their whitelabel's location
    if (contact?.id) {
      const { getSupabaseClient } = await import("@/lib/db/courses");
      const supabase = getSupabaseClient();
      await (supabase.from("users") as any)
        .update({
          ghl_contact_id: contact.id,
          ghl_location_id: locationId,
        })
        .eq("id", userId);
    }

    return contact;
  } catch (error) {
    console.error("Error syncing user to GHL:", error);
    throw error;
  }
}

