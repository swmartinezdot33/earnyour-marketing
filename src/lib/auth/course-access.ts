import { getSupabaseClient } from "@/lib/db/courses";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { getUserById } from "@/lib/db/users";
import { checkCourseAccess } from "@/lib/ghl/courses";
import { getCourseBySlug, getAllCourses } from "@/lib/db/courses";
import type { Course } from "@/lib/db/schema";

interface AccessResult {
  hasAccess: boolean;
  source: "database" | "ghl" | "both";
  reason?: string;
}

/**
 * Check if user has access to a course
 * First checks local database, then validates with GHL
 */
export async function checkCourseAccessForUser(
  userId: string,
  courseId: string
): Promise<AccessResult> {
  // First check local database (fastest)
  const hasLocalAccess = await isUserEnrolled(userId, courseId);

  // Get user to check GHL contact ID
  const user = await getUserById(userId);
  if (!user) {
    return {
      hasAccess: false,
      source: "database",
      reason: "User not found",
    };
  }

  // If no GHL contact ID, only check database
  if (!user.ghl_contact_id) {
    return {
      hasAccess: hasLocalAccess,
      source: "database",
      reason: hasLocalAccess ? undefined : "Not enrolled in database",
    };
  }

  // Get course details for GHL check
  const supabase = getSupabaseClient();
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!courseData) {
    return {
      hasAccess: false,
      source: "database",
      reason: "Course not found",
    };
  }

  const course = courseData as Course;

  // Check GHL access
  try {
    const hasGHLAccess = await checkCourseAccess(
      user.ghl_contact_id,
      courseId,
      course.title,
      user.ghl_location_id || undefined
    );

    // User has access if either source grants it
    const hasAccess = hasLocalAccess || hasGHLAccess;

    return {
      hasAccess,
      source: hasLocalAccess && hasGHLAccess ? "both" : hasLocalAccess ? "database" : "ghl",
      reason: hasAccess ? undefined : "Not enrolled in database or GHL",
    };
  } catch (error) {
    console.error("Error checking GHL access:", error);
    // If GHL check fails, fall back to database only
    return {
      hasAccess: hasLocalAccess,
      source: "database",
      reason: hasLocalAccess ? undefined : "Not enrolled (GHL check failed)",
    };
  }
}

/**
 * Validate GHL membership status
 */
export async function validateGHLMembership(
  userId: string
): Promise<{
  status: "active" | "expired" | "cancelled" | "unknown";
  tier?: "basic" | "premium" | "enterprise";
}> {
  const user = await getUserById(userId);
  if (!user || !user.ghl_contact_id) {
    return { status: "unknown" };
  }

  try {
    const { ghlClient } = await import("@/lib/ghl/client");
    const contact = await ghlClient.getContactById(user.ghl_contact_id);
    
    if (!contact) {
      return { status: "unknown" };
    }

    const membershipStatus = contact.customFields?.membership_status || "unknown";
    const membershipTier = contact.customFields?.membership_tier;

    return {
      status: membershipStatus as "active" | "expired" | "cancelled" | "unknown",
      tier: membershipTier as "basic" | "premium" | "enterprise" | undefined,
    };
  } catch (error) {
    console.error("Error validating GHL membership:", error);
    return { status: "unknown" };
  }
}

/**
 * Force refresh access from GHL
 * Useful when access might have changed in GHL
 */
export async function refreshAccessFromGHL(
  userId: string
): Promise<{
  courses: string[];
  membership: {
    status: "active" | "expired" | "cancelled" | "unknown";
    tier?: "basic" | "premium" | "enterprise";
  };
}> {
  const user = await getUserById(userId);
  if (!user || !user.ghl_contact_id) {
    return {
      courses: [],
      membership: { status: "unknown" },
    };
  }

  try {
    const { getUserCourses } = await import("@/lib/ghl/courses");
    const courses = await getUserCourses(
      user.ghl_contact_id,
      user.ghl_location_id || undefined
    );

    const membership = await validateGHLMembership(userId);

    // Optionally sync courses back to local database
    // This could create enrollments for courses found in GHL but not in DB

    return {
      courses: courses.map((c) => c.courseId),
      membership,
    };
  } catch (error) {
    console.error("Error refreshing access from GHL:", error);
    return {
      courses: [],
      membership: { status: "unknown" },
    };
  }
}

/**
 * Check access for course by slug (for route protection)
 */
export async function checkCourseAccessBySlug(
  userId: string,
  courseSlug: string
): Promise<AccessResult> {
  const course = await getCourseBySlug(courseSlug);
  if (!course) {
    return {
      hasAccess: false,
      source: "database",
      reason: "Course not found",
    };
  }

  return checkCourseAccessForUser(userId, course.id);
}

