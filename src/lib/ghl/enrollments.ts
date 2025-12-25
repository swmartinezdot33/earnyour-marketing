import { getSupabaseClient } from "@/lib/db/courses";
import { getUserById } from "@/lib/db/users";
import { getCourseBySlug, getAllCourses } from "@/lib/db/courses";
import { ghlClient } from "./client";
import { grantCourseAccess, updateMembershipStatus } from "./courses";
import { moveToPipelineStage, createCoursePipeline, getPipelines } from "./pipelines";
import { triggerAutomation } from "./automations";
import { getUserGHLLocationId, getGHLClientForUser } from "./user-location";
import type { Enrollment } from "@/lib/db/schema";

/**
 * Main function to sync enrollment to GHL
 * Handles contact creation, course access, pipeline, and automation
 */
export async function syncEnrollmentToGHL(
  enrollmentId: string,
  options?: {
    pipelineId?: string;
    stageId?: string;
    automationId?: string;
  }
): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Get enrollment data
  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select(`
      *,
      user:users(*),
      course:courses(*)
    `)
    .eq("id", enrollmentId)
    .single();

  if (enrollmentError || !enrollment) {
    throw new Error(`Enrollment ${enrollmentId} not found`);
  }

  const user = (enrollment as any).user;
  const course = (enrollment as any).course;

  if (!user || !course) {
    throw new Error("User or course not found for enrollment");
  }

  // Get the appropriate GHL client and location for this user
  const client = await getGHLClientForUser(user.id);
  const locationId = await getUserGHLLocationId(user.id);

  // Create or update contact in GHL
  let contact = await client.findContactByEmail(user.email);
  
  if (!contact) {
    contact = await client.createOrUpdateContact({
      email: user.email,
      name: user.name || undefined,
    });
  } else {
    // Update contact if needed
    contact = await client.createOrUpdateContact({
      email: user.email,
      name: user.name || undefined,
    });
  }

  if (!contact || !contact.id) {
    throw new Error("Failed to create or find contact in GHL");
  }

  // Update user record with GHL contact ID and location
  await (supabase.from("users") as any)
    .update({ 
      ghl_contact_id: contact.id,
      ghl_location_id: locationId,
    })
    .eq("id", user.id);

  // Grant course access using the correct location
  await grantCourseAccess(
    contact.id,
    course.id,
    course.title,
    locationId
  );

  // Move to pipeline stage if configured
  if (options?.pipelineId && options?.stageId) {
    try {
      await moveToPipelineStage(
        contact.id,
        options.pipelineId,
        options.stageId,
        locationId
      );
    } catch (error) {
      console.error("Error moving to pipeline stage:", error);
      // Don't fail the whole sync if pipeline fails
    }
  } else {
    // Try to use default course pipeline
    try {
      const pipelines = await getPipelines(locationId);
      const coursePipeline = pipelines.find(
        (p: any) => p.name === "Course Enrollments"
      ) || await createCoursePipeline(locationId);

      if (coursePipeline && coursePipeline.stages?.[0]) {
        await moveToPipelineStage(
          contact.id,
          coursePipeline.id,
          coursePipeline.stages[0].id,
          locationId
        );
      }
    } catch (error) {
      console.error("Error setting up default pipeline:", error);
    }
  }

  // Trigger automation if configured
  if (options?.automationId) {
    try {
      await triggerAutomation(
        contact.id,
        options.automationId,
        locationId
      );
    } catch (error) {
      console.error("Error triggering automation:", error);
      // Don't fail the whole sync if automation fails
    }
  } else if (process.env.GHL_COURSE_AUTOMATION_ID) {
    try {
      await triggerAutomation(
        contact.id,
        process.env.GHL_COURSE_AUTOMATION_ID,
        locationId
      );
    } catch (error) {
      console.error("Error triggering default automation:", error);
    }
  }

  // Update enrollment with sync timestamp
  await (supabase.from("enrollments") as any)
    .update({ ghl_synced_at: new Date().toISOString() })
    .eq("id", enrollmentId);

  // Log sync success
  await (supabase.from("ghl_sync_logs") as any).insert({
    user_id: user.id,
    enrollment_id: enrollmentId,
    action: "enroll",
    status: "success",
    ghl_response: JSON.stringify({ contact_id: contact.id }),
  });
}

/**
 * Sync Stripe purchase to GHL
 * Records transaction and updates membership status
 */
export async function syncPurchaseToGHL(
  purchaseId: string
): Promise<void> {
  const supabase = getSupabaseClient();
  
  // Get purchase data
  const { data: purchase, error: purchaseError } = await supabase
    .from("stripe_purchases")
    .select(`
      *,
      user:users(*),
      course:courses(*)
    `)
    .eq("id", purchaseId)
    .single();

  if (purchaseError || !purchase) {
    throw new Error(`Purchase ${purchaseId} not found`);
  }

  const user = (purchase as any).user;
  const course = (purchase as any).course;

  if (!user || !course) {
    throw new Error("User or course not found for purchase");
  }

  // Get the appropriate GHL client and location for this user
  const client = await getGHLClientForUser(user.id);
  const locationId = await getUserGHLLocationId(user.id);

  // Get or create contact
  let contact = await client.findContactByEmail(user.email);
  
  if (!contact || !contact.id) {
    contact = await client.createOrUpdateContact({
      email: user.email,
      name: user.name || undefined,
    });
  }

  if (!contact || !contact.id) {
    throw new Error("Failed to create or find contact in GHL");
  }

  // Update total spent custom field
  const currentTotal = contact.customFields?.total_spent || 0;
  const newTotal = Number(currentTotal) + (purchase as any).amount;

  await client.updateCustomFields(contact.id, {
    ...contact.customFields,
    total_spent: newTotal,
    last_course_purchase: new Date().toISOString(),
  });

  // Update membership status if this is a significant purchase
  const purchaseAmount = (purchase as any).amount;
  if (purchaseAmount >= 100) {
    await updateMembershipStatus(
      contact.id,
      "active",
      purchaseAmount >= 500 ? "enterprise" : purchaseAmount >= 200 ? "premium" : "basic",
      locationId
    );
  }
}

/**
 * Complete purchase flow - handles enrollment and GHL sync
 */
export async function handleCoursePurchase(
  userId: string,
  courseId: string,
  purchaseId: string,
  options?: {
    pipelineId?: string;
    stageId?: string;
    automationId?: string;
  }
): Promise<void> {
  // First, get the enrollment that was created
  const supabase = getSupabaseClient();
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .order("enrolled_at", { ascending: false })
    .limit(1)
    .single();

  if (!enrollment) {
    throw new Error("Enrollment not found after purchase");
  }

  // Sync purchase to GHL
  await syncPurchaseToGHL(purchaseId);

  // Sync enrollment to GHL
  await syncEnrollmentToGHL((enrollment as Enrollment).id, options);
}

