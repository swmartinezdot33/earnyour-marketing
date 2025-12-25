import { getSupabaseClient } from "./courses";
import type { Progress } from "./schema";

export async function updateLessonProgress(
  userId: string,
  lessonId: string,
  progress: {
    completed?: boolean;
    progress_percentage?: number;
    last_position?: number;
  }
) {
  const updateData: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (progress.completed !== undefined) {
    updateData.completed = progress.completed;
    if (progress.completed) {
      updateData.completed_at = new Date().toISOString();
    }
  }
  
  if (progress.progress_percentage !== undefined) {
    updateData.progress_percentage = progress.progress_percentage;
  }
  
  if (progress.last_position !== undefined) {
    updateData.last_position = progress.last_position;
  }
  
  const client = getSupabaseClient();
  const { data, error } = await (client.from("progress") as any)
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        ...updateData,
      },
      {
        onConflict: "user_id,lesson_id",
      }
    )
    .select()
    .single();
  
  if (error) throw error;
  return data as Progress;
}

export async function getLessonProgress(userId: string, lessonId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .single();
  
  if (error && error.code !== "PGRST116") throw error;
  return data as Progress | null;
}

export async function getUserProgressForCourse(userId: string, courseId: string) {
  const client = getSupabaseClient();
  // Get all lessons for the course
  const { data: modules } = await client
    .from("modules")
    .select("id")
    .eq("course_id", courseId);
  
  if (!modules || modules.length === 0) {
    return [];
  }
  
  const moduleIds = (modules as any[]).map(m => m.id);
  
  const { data: lessons } = await client
    .from("lessons")
    .select("id")
    .in("module_id", moduleIds);
  
  if (!lessons || lessons.length === 0) {
    return [];
  }
  
  const lessonIds = (lessons as any[]).map(l => l.id);
  
  const { data, error } = await client
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds);
  
  if (error) throw error;
  return data as Progress[];
}

