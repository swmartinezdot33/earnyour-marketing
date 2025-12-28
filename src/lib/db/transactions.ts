import { getSupabaseClient } from "./courses";
import type { StripePurchase } from "./schema";

export interface TransactionWithDetails extends StripePurchase {
  course: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    email: string;
    name: string | null;
  };
}

/**
 * Get all transactions for a specific user
 */
export async function getUserTransactions(userId: string): Promise<TransactionWithDetails[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("stripe_purchases")
    .select(`
      *,
      course:courses(id, title, slug),
      user:users(id, email, name)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get user transactions: ${error.message}`);
  }

  return (data || []) as TransactionWithDetails[];
}

/**
 * Get all transactions (admin only)
 */
export async function getAllTransactions(): Promise<TransactionWithDetails[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("stripe_purchases")
    .select(`
      *,
      course:courses(id, title, slug),
      user:users(id, email, name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to get all transactions: ${error.message}`);
  }

  return (data || []) as TransactionWithDetails[];
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<TransactionWithDetails | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("stripe_purchases")
    .select(`
      *,
      course:courses(id, title, slug),
      user:users(id, email, name)
    `)
    .eq("id", transactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to get transaction: ${error.message}`);
  }

  return data as TransactionWithDetails;
}







