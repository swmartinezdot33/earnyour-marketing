import { GHLClient } from "./client";
import { getWhitelabelAccountById } from "../db/whitelabel";
import type { User } from "../db/schema";

/**
 * Get a GHL client for a specific whitelabel account
 */
export async function getWhitelabelGHLClient(
  whitelabelId: string
): Promise<GHLClient | null> {
  const whitelabel = await getWhitelabelAccountById(whitelabelId);
  
  if (!whitelabel) {
    return null;
  }

  return new GHLClient(whitelabel.ghl_api_token, whitelabel.ghl_location_id);
}

/**
 * Get membership status for a user from their whitelabel GHL account
 */
export async function getWhitelabelMembershipStatus(
  userId: string,
  whitelabelId: string
): Promise<{
  membershipStatus: string | null;
  membershipTier: string | null;
  enrolledCourses: string[];
  totalCoursesEnrolled: number;
  totalSpent: number;
  lastCoursePurchase: string | null;
} | null> {
  const client = await getWhitelabelGHLClient(whitelabelId);
  if (!client) {
    return null;
  }

  // Get user's GHL contact ID
  const { getSupabaseClient } = await import("../db/courses");
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase
    .from("users")
    .select("ghl_contact_id")
    .eq("id", userId)
    .single();

  const user = userData as { ghl_contact_id: string | null } | null;
  if (!user?.ghl_contact_id) {
    return null;
  }

  const contact = await client.getContactById(user.ghl_contact_id);
  if (!contact) {
    return null;
  }

  const customFields = contact.customFields || {};

  return {
    membershipStatus: customFields.membership_status || null,
    membershipTier: customFields.membership_tier || null,
    enrolledCourses: Array.isArray(customFields.enrolled_courses)
      ? customFields.enrolled_courses
      : [],
    totalCoursesEnrolled: Number(customFields.total_courses_enrolled) || 0,
    totalSpent: Number(customFields.total_spent) || 0,
    lastCoursePurchase: customFields.last_course_purchase || null,
  };
}

/**
 * Update membership status in whitelabel GHL account
 */
export async function updateWhitelabelMembershipStatus(
  userId: string,
  whitelabelId: string,
  updates: {
    membershipStatus?: string;
    membershipTier?: string;
    totalSpent?: number;
  }
): Promise<void> {
  const client = await getWhitelabelGHLClient(whitelabelId);
  if (!client) {
    throw new Error("Whitelabel account not found");
  }

  // Get user's GHL contact ID
  const { getSupabaseClient } = await import("../db/courses");
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase
    .from("users")
    .select("ghl_contact_id")
    .eq("id", userId)
    .single();

  const user = userData as { ghl_contact_id: string | null } | null;
  if (!user?.ghl_contact_id) {
    throw new Error("User does not have a GHL contact ID");
  }

  const contact = await client.getContactById(user.ghl_contact_id);
  if (!contact) {
    throw new Error("Contact not found in GHL");
  }

  const customFields = contact.customFields || {};

  await client.updateCustomFields(user.ghl_contact_id, {
    ...customFields,
    ...(updates.membershipStatus && { membership_status: updates.membershipStatus }),
    ...(updates.membershipTier && { membership_tier: updates.membershipTier }),
    ...(updates.totalSpent !== undefined && { total_spent: updates.totalSpent }),
  });
}

/**
 * Grant course access in whitelabel GHL account
 */
export async function grantWhitelabelCourseAccess(
  userId: string,
  whitelabelId: string,
  courseId: string,
  courseName: string
): Promise<void> {
  const client = await getWhitelabelGHLClient(whitelabelId);
  if (!client) {
    throw new Error("Whitelabel account not found");
  }

  // Get user's GHL contact ID
  const { getSupabaseClient } = await import("../db/courses");
  const supabase = getSupabaseClient();
  const { data: userData } = await supabase
    .from("users")
    .select("ghl_contact_id")
    .eq("id", userId)
    .single();

  const user = userData as { ghl_contact_id: string | null } | null;
  if (!user?.ghl_contact_id) {
    throw new Error("User does not have a GHL contact ID");
  }

  // Add course tag
  await client.addTagsToContact(user.ghl_contact_id, [`Course: ${courseName}`]);

  // Update custom fields
  const contact = await client.getContactById(user.ghl_contact_id);
  const enrolledCourses = contact?.customFields?.enrolled_courses || [];
  if (!enrolledCourses.includes(courseId)) {
    enrolledCourses.push(courseId);
  }

  await client.updateCustomFields(user.ghl_contact_id, {
    ...contact?.customFields,
    enrolled_courses: enrolledCourses,
    total_courses_enrolled: enrolledCourses.length,
    last_course_purchase: new Date().toISOString(),
  });
}
