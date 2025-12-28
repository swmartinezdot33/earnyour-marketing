import { getSupabaseClient } from "@/lib/db/courses";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { getUserById } from "@/lib/db/users";
import { getCourseBySlug } from "@/lib/db/courses";
import type { Course } from "@/lib/db/schema";

interface AccessResult {
  hasAccess: boolean;
  source: "database";
  reason?: string;
}

/**
 * Check if user has access to a course
 * Checks local database only
 */
export async function checkCourseAccessForUser(
  userId: string,
  courseId: string
): Promise<AccessResult> {
  // First check local database (fastest)
  const hasLocalAccess = await isUserEnrolled(userId, courseId);

  return {
    hasAccess: hasLocalAccess,
    source: "database",
    reason: hasLocalAccess ? undefined : "Not enrolled in database",
  };
}

/**
 * Validate membership status (Stub)
 */
export async function validateGHLMembership(
  userId: string
): Promise<{
  status: "active" | "expired" | "cancelled" | "unknown";
  tier?: "basic" | "premium" | "enterprise";
}> {
  return { status: "unknown" };
}

/**
 * Force refresh access (Stub)
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
  return {
    courses: [],
    membership: { status: "unknown" },
  };
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

