import { getSupabaseClient } from "./courses";
import type { User } from "./schema";

/**
 * Get all users (admin only)
 * Excludes deleted users by default
 */
export async function getAllUsers(includeDeleted: boolean = false): Promise<User[]> {
  const client = getSupabaseClient();
  
  let query = client.from("users").select("*");
  
  if (!includeDeleted) {
    query = query.neq("status", "deleted");
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) {
    throw new Error(`Failed to get users: ${error.message}`);
  }
  
  return (data || []) as User[];
}

/**
 * Delete a user (admin only)
 * Soft delete: Sets status to 'deleted'
 */
export async function deleteUser(userId: string): Promise<void> {
  const client = getSupabaseClient();
  
  const { error } = await (client.from("users") as any)
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  
  if (error) {
    throw new Error(`Failed to delete user: ${error.message}`);
  }
}

