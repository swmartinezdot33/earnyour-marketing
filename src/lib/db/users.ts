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

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">) {
  const client = getSupabaseClient();
  const userData = {
    ...user,
    status: user.status || "active",
  };
  const { data, error } = await (client.from("users") as any)
    .from("users")
    .insert([userData])
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

export async function updateUser(userId: string, updates: Partial<User>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("users") as any)
    .from("users")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as User;
}

