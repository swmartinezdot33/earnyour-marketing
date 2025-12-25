import { getSupabaseClient } from "./courses";
import type { WhitelabelAccount, WhitelabelUserAssignment } from "./schema";

/**
 * Create a new whitelabel account
 */
export async function createWhitelabelAccount(
  ownerId: string,
  data: {
    name: string;
    ghlLocationId: string;
    ghlApiToken: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  }
): Promise<WhitelabelAccount> {
  const supabase = getSupabaseClient();

  const { data: whitelabel, error } = await (supabase.from("whitelabel_accounts") as any)
    .insert({
      owner_id: ownerId,
      name: data.name,
      ghl_location_id: data.ghlLocationId,
      ghl_api_token: data.ghlApiToken,
      branding: data.branding || {},
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create whitelabel account: ${error.message}`);
  }

  return whitelabel as WhitelabelAccount;
}

/**
 * Get a whitelabel account by ID
 */
export async function getWhitelabelAccountById(
  id: string
): Promise<WhitelabelAccount | null> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("whitelabel_accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get whitelabel account: ${error.message}`);
  }

  return data as WhitelabelAccount;
}

/**
 * Get all whitelabel accounts for an owner
 */
export async function getWhitelabelAccountsByOwner(
  ownerId: string
): Promise<WhitelabelAccount[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("whitelabel_accounts")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get whitelabel accounts: ${error.message}`);
  }

  return (data || []) as WhitelabelAccount[];
}

/**
 * Get all whitelabel accounts (admin only)
 */
export async function getAllWhitelabelAccounts(): Promise<WhitelabelAccount[]> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("whitelabel_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get whitelabel accounts: ${error.message}`);
  }

  return (data || []) as WhitelabelAccount[];
}

/**
 * Update a whitelabel account
 */
export async function updateWhitelabelAccount(
  id: string,
  updates: Partial<{
    name: string;
    ghlLocationId: string;
    ghlApiToken: string;
    branding: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
    status: "active" | "suspended" | "pending";
  }>
): Promise<WhitelabelAccount> {
  const supabase = getSupabaseClient();

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.name) updateData.name = updates.name;
  if (updates.ghlLocationId) updateData.ghl_location_id = updates.ghlLocationId;
  if (updates.ghlApiToken) updateData.ghl_api_token = updates.ghlApiToken;
  if (updates.branding) updateData.branding = updates.branding;
  if (updates.status) updateData.status = updates.status;

  const { data, error } = await (supabase.from("whitelabel_accounts") as any)
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update whitelabel account: ${error.message}`);
  }

  return data as WhitelabelAccount;
}

/**
 * Delete a whitelabel account
 */
export async function deleteWhitelabelAccount(id: string): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("whitelabel_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to delete whitelabel account: ${error.message}`);
  }
}

/**
 * Assign a user to a whitelabel account
 */
export async function assignUserToWhitelabel(
  userId: string,
  whitelabelId: string
): Promise<WhitelabelUserAssignment> {
  const supabase = getSupabaseClient();

  const { data, error } = await (supabase.from("whitelabel_user_assignments") as any)
    .insert({
      user_id: userId,
      whitelabel_id: whitelabelId,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to assign user to whitelabel: ${error.message}`);
  }

  // Update user's whitelabel_id for quick lookup
  await (supabase.from("users") as any)
    .update({ whitelabel_id: whitelabelId })
    .eq("id", userId);

  return data as WhitelabelUserAssignment;
}

/**
 * Remove a user from a whitelabel account
 */
export async function removeUserFromWhitelabel(
  userId: string,
  whitelabelId: string
): Promise<void> {
  const supabase = getSupabaseClient();

  const { error } = await supabase
    .from("whitelabel_user_assignments")
    .delete()
    .eq("user_id", userId)
    .eq("whitelabel_id", whitelabelId);

  if (error) {
    throw new Error(`Failed to remove user from whitelabel: ${error.message}`);
  }

  // Clear user's whitelabel_id if this was their only assignment
  const { data: remainingAssignments } = await supabase
    .from("whitelabel_user_assignments")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (!remainingAssignments || remainingAssignments.length === 0) {
    await (supabase.from("users") as any)
      .update({ whitelabel_id: null })
      .eq("id", userId);
  }
}

/**
 * Get all users assigned to a whitelabel account
 */
export async function getUsersByWhitelabel(
  whitelabelId: string
): Promise<Array<WhitelabelUserAssignment & { user: { id: string; email: string; name: string | null } }>> {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from("whitelabel_user_assignments")
    .select(`
      *,
      user:users(id, email, name)
    `)
    .eq("whitelabel_id", whitelabelId)
    .order("assigned_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get users by whitelabel: ${error.message}`);
  }

  return (data || []) as Array<WhitelabelUserAssignment & { user: { id: string; email: string; name: string | null } }>;
}

/**
 * Get whitelabel account for a user
 */
export async function getWhitelabelAccountForUser(
  userId: string
): Promise<WhitelabelAccount | null> {
  const supabase = getSupabaseClient();

  // First check if user has a direct whitelabel_id
  const { data: userData } = await supabase
    .from("users")
    .select("whitelabel_id")
    .eq("id", userId)
    .single();

  const user = userData as { whitelabel_id: string | null } | null;
  if (user?.whitelabel_id) {
    return getWhitelabelAccountById(user.whitelabel_id);
  }

  // Otherwise, check assignments
  const { data: assignmentData } = await supabase
    .from("whitelabel_user_assignments")
    .select("whitelabel_id")
    .eq("user_id", userId)
    .limit(1)
    .single();

  const assignment = assignmentData as { whitelabel_id: string } | null;
  if (assignment?.whitelabel_id) {
    return getWhitelabelAccountById(assignment.whitelabel_id);
  }

  return null;
}
