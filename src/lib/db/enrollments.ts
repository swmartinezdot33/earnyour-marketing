import { getSupabaseClient } from "./courses";
import type { Enrollment, Progress } from "./schema";

export async function enrollUserInCourse(userId: string, courseId: string, stripePurchaseId?: string) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("enrollments") as any)
    .insert([
      {
        user_id: userId,
        course_id: courseId,
        stripe_purchase_id: stripePurchaseId || null,
      },
    ])
    .select()
    .single();
  
  if (error) throw error;
  return data as Enrollment;
}

export async function getUserEnrollments(userId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("enrollments")
    .select(`
      *,
      course:courses(*)
    `)
    .eq("user_id", userId)
    .order("enrolled_at", { ascending: false });
  
  if (error) throw error;
  return data as (Enrollment & { course: any })[];
}

export async function isUserEnrolled(userId: string, courseId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  return !!data;
}

export async function markCourseComplete(userId: string, courseId: string) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("enrollments") as any)
    .update({ completed_at: new Date().toISOString() })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .select()
    .single();
  
  if (error) throw error;
  return data as Enrollment;
}

export async function getCourseProgress(userId: string, courseId: string) {
  const client = getSupabaseClient();
  // Get all lessons for the course
  const { data: modules } = await client
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  
  if (!modules || modules.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const moduleIds = (modules as any[]).map(m => m.id);
  
  const { data: lessons } = await client
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);
  
  if (!lessons || lessons.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  
  const lessonIds = (lessons as any[]).map(l => l.id);
  
  // Get completed lessons
  const { data: completed } = await client
    .from("progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .in("lesson_id", lessonIds);
  
  const completedCount = (completed as any[])?.length || 0;
  const total = (lessons as any[]).length;
  const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  
  return { completed: completedCount, total, percentage };
}

