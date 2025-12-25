// Helper functions to determine which GHL location to use for a user

import { getSupabaseClient } from "@/lib/db/courses";
import { getWhitelabelAccountById } from "@/lib/db/whitelabel";
import type { User } from "@/lib/db/schema";

// Default SaaS management location ID
// Regular users (non-SaaS customers) are created as contacts in this location
// They do NOT have a subaccount ID - they're just contacts in GQOh2EMzgc3bRAfN7Q9j
const DEFAULT_SAAS_LOCATION_ID = process.env.GHL_DEFAULT_LOCATION_ID || "GQOh2EMzgc3bRAfN7Q9j";

/**
 * Get the GHL location ID for a user
 * 
 * IMPORTANT: Regular users (non-SaaS) ALWAYS use the default location (GQOh2EMzgc3bRAfN7Q9j)
 * for courses, memberships, and marketing. We only use whitelabel subaccounts when
 * someone has purchased the whitelabel SaaS GHL product.
 * 
 * - If user has a whitelabel assignment (purchased whitelabel SaaS), use that whitelabel's location
 * - Otherwise (regular user), ALWAYS use the default SaaS management location
 *   Regular users are just contacts in the default location, not subaccounts
 */
export async function getUserGHLLocationId(userId: string): Promise<string> {
  const supabase = getSupabaseClient();
  
  // Get user with whitelabel info
  const { data: userData, error } = await supabase
    .from("users")
    .select("whitelabel_id, ghl_location_id")
    .eq("id", userId)
    .single();

  if (error || !userData) {
    // If user not found, return default
    return DEFAULT_SAAS_LOCATION_ID;
  }

  const user = userData as { whitelabel_id: string | null; ghl_location_id: string | null };

  // ONLY use whitelabel location if user has purchased whitelabel SaaS
  // Regular users (courses, memberships, marketing) ALWAYS use default location
  if (user.whitelabel_id) {
    const whitelabel = await getWhitelabelAccountById(user.whitelabel_id);
    if (whitelabel) {
      // This user has purchased whitelabel SaaS - use their subaccount
      return whitelabel.ghl_location_id;
    }
  }

  // Regular users: ALWAYS use default location (GQOh2EMzgc3bRAfN7Q9j)
  // This is where ALL course enrollments, memberships, and marketing happens
  // We only use whitelabel subaccounts when someone purchases whitelabel SaaS GHL
  return DEFAULT_SAAS_LOCATION_ID;
}

/**
 * Get the GHL location ID for a user by email
 */
export async function getUserGHLLocationIdByEmail(email: string): Promise<string> {
  const supabase = getSupabaseClient();
  
  const { data: userData, error } = await supabase
    .from("users")
    .select("id, whitelabel_id, ghl_location_id")
    .eq("email", email.toLowerCase())
    .single();

  if (error || !userData) {
    return DEFAULT_SAAS_LOCATION_ID;
  }

  const user = userData as { id: string; whitelabel_id: string | null; ghl_location_id: string | null };
  return getUserGHLLocationId(user.id);
}

/**
 * Get GHL client for a specific user
 * 
 * IMPORTANT: Regular users ALWAYS use the default location for courses, memberships, marketing.
 * Only whitelabel SaaS customers use their own subaccount.
 * 
 * - Whitelabel SaaS customers (with whitelabel_id): Uses whitelabel's API token and location
 * - Regular users (no whitelabel_id): Uses default API token and default location
 *   Regular users are just contacts in the default location (GQOh2EMzgc3bRAfN7Q9j)
 */
export async function getGHLClientForUser(userId: string) {
  const { GHLClient } = await import("./client");
  const locationId = await getUserGHLLocationId(userId);
  
  // Check if user has purchased whitelabel SaaS
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase
    .from("users")
    .select("whitelabel_id")
    .eq("id", userId)
    .single();

  const user = userData as { whitelabel_id: string | null } | null;

  // ONLY use whitelabel client if user has purchased whitelabel SaaS
  if (user?.whitelabel_id) {
    const whitelabel = await getWhitelabelAccountById(user.whitelabel_id);
    if (whitelabel) {
      // User has whitelabel SaaS - use their subaccount
      return new GHLClient(whitelabel.ghl_api_token, whitelabel.ghl_location_id);
    }
  }

  // Regular users: Use standard GHL API 2.0 client with default location PIT token
  // Use the default location PIT token and location ID for regular users
  const defaultToken = process.env.GHL_DEFAULT_LOCATION_PIT_TOKEN || process.env.GHL_API_TOKEN;
  if (!defaultToken) {
    throw new Error("GHL_DEFAULT_LOCATION_PIT_TOKEN or GHL_API_TOKEN is not set. Required for regular users.");
  }
  return new GHLClient(defaultToken, DEFAULT_SAAS_LOCATION_ID);
}

/**
 * Update user's GHL location ID in database
 */
export async function updateUserGHLLocation(userId: string, locationId: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  await (supabase.from("users") as any)
    .update({ ghl_location_id: locationId })
    .eq("id", userId);
}

