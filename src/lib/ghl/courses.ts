import { ghlClient, GHLClient } from "./client";

export interface CourseAccess {
  courseId: string;
  courseName: string;
  enrolledAt: string;
  completed: boolean;
}

/**
 * Grant course access to a contact in GHL
 * Adds course tag and updates custom fields
 */
export async function grantCourseAccess(
  contactId: string,
  courseId: string,
  courseName: string,
  locationId?: string
): Promise<void> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  
  // Add course tag
  await client.addTagsToContact(contactId, [
    `Course: ${courseName}`,
    `Course Access`,
  ]);

  // Get current contact to read existing custom fields
  const contact = await client.getContactById(contactId);
  if (!contact) {
    throw new Error(`Contact ${contactId} not found in GHL`);
  }

  // Update custom fields
  const currentEnrolledCourses = contact.customFields?.enrolled_courses || [];
  const enrolledCourses = Array.isArray(currentEnrolledCourses) 
    ? [...currentEnrolledCourses] 
    : [];

  // Add course if not already in array
  if (!enrolledCourses.includes(courseId)) {
    enrolledCourses.push(courseId);
  }

  // Update custom fields
  await client.updateCustomFields(contactId, {
    ...contact.customFields,
    enrolled_courses: enrolledCourses,
    total_courses_enrolled: enrolledCourses.length,
    last_course_purchase: new Date().toISOString(),
  });
}

/**
 * Revoke course access from a contact in GHL
 * Removes course tag and updates custom fields
 */
export async function revokeCourseAccess(
  contactId: string,
  courseId: string,
  courseName: string,
  locationId?: string
): Promise<void> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  
  // Get contact to find tag IDs
  const contact = await client.getContactById(contactId);
  if (!contact) {
    throw new Error(`Contact ${contactId} not found in GHL`);
  }

  // Get all tags to find the course tag
  const allTags = await client.request(`/tags/v2/locations/${process.env.GHL_LOCATION_ID}`);
  const courseTag = allTags.tags?.find((t: any) => 
    t.name === `Course: ${courseName}`
  );

  // Remove course tag if found
  if (courseTag && contact.tags?.includes(courseTag.id)) {
    await client.removeTagsFromContact(contactId, [courseTag.id]);
  }

  // Update custom fields - remove course from array
  const currentEnrolledCourses = contact.customFields?.enrolled_courses || [];
  const enrolledCourses = Array.isArray(currentEnrolledCourses)
    ? currentEnrolledCourses.filter((id: string) => id !== courseId)
    : [];

  await client.updateCustomFields(contactId, {
    ...contact.customFields,
    enrolled_courses: enrolledCourses,
    total_courses_enrolled: enrolledCourses.length,
  });
}

/**
 * Check if a contact has access to a course
 * Validates via both tags and custom fields
 */
export async function checkCourseAccess(
  contactId: string,
  courseId: string,
  courseName: string,
  locationId?: string
): Promise<boolean> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  
  try {
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return false;
    }

    // Check custom fields first (more reliable)
    const enrolledCourses = contact.customFields?.enrolled_courses || [];
    if (Array.isArray(enrolledCourses) && enrolledCourses.includes(courseId)) {
      return true;
    }

    // Check tags as fallback
    const courseTagName = `Course: ${courseName}`;
    const locId = locationId || process.env.GHL_LOCATION_ID;
    if (!locId) return false;
    const allTags = await client.request(`/tags/v2/locations/${locId}`);
    const courseTag = allTags.tags?.find((t: any) => t.name === courseTagName);
    
    if (courseTag && contact.tags?.includes(courseTag.id)) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking course access:", error);
    return false;
  }
}

/**
 * Get all courses a user has access to from GHL
 */
export async function getUserCourses(
  contactId: string,
  locationId?: string
): Promise<CourseAccess[]> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  
  try {
    const contact = await client.getContactById(contactId);
    if (!contact) {
      return [];
    }

    const enrolledCourses = contact.customFields?.enrolled_courses || [];
    if (!Array.isArray(enrolledCourses)) {
      return [];
    }

    // Return course IDs - you'll need to map these to course names from your DB
    return enrolledCourses.map((courseId: string) => ({
      courseId,
      courseName: "", // Will be populated from database
      enrolledAt: contact.customFields?.last_course_purchase || new Date().toISOString(),
      completed: false, // Would need to check completion status
    }));
  } catch (error) {
    console.error("Error getting user courses:", error);
    return [];
  }
}

/**
 * Update membership status in GHL
 */
export async function updateMembershipStatus(
  contactId: string,
  status: "active" | "expired" | "cancelled",
  tier?: "basic" | "premium" | "enterprise",
  locationId?: string
): Promise<void> {
  const client = locationId && process.env.GHL_API_TOKEN 
    ? new GHLClient(process.env.GHL_API_TOKEN, locationId) 
    : ghlClient;
  
  const contact = await client.getContactById(contactId);
  if (!contact) {
    throw new Error(`Contact ${contactId} not found in GHL`);
  }

  await client.updateCustomFields(contactId, {
    ...contact.customFields,
    membership_status: status,
    ...(tier && { membership_tier: tier }),
  });
}

