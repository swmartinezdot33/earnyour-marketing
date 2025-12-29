import { getSupabaseClient } from "./courses";
import type { User } from "./schema";

export async function getUserById(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data as User;
}

export async function getUserByEmail(email: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase())
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  return data as User | null;
}

export async function findContactByEmail(email: string) {
  return getUserByEmail(email);
}

export async function createUser(user: Partial<Omit<User, "id" | "created_at" | "updated_at">> & { email: string; role: "admin" | "student" }) {
  const client = getSupabaseClient();
  const userData = {
    email: user.email.toLowerCase(),
    name: user.name || null,
    role: user.role,
    status: user.status || "active",
    deleted_at: user.deleted_at || null,
    // GHL fields are optional - only include if provided
    ...(user.ghl_contact_id !== undefined && { ghl_contact_id: user.ghl_contact_id }),
    ...(user.ghl_location_id !== undefined && { ghl_location_id: user.ghl_location_id }),
    ...(user.whitelabel_id !== undefined && { whitelabel_id: user.whitelabel_id }),
  };
  const { data, error } = await (client.from("users") as any)
    .insert([userData])
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("users") as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

