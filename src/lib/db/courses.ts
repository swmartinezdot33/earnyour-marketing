import { createClient } from "@supabase/supabase-js";
import type { User, Course, Module, Lesson, LessonContent, Enrollment, Progress, Certificate, StripeProduct, StripePurchase } from "./schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Lazy initialization to avoid build-time errors
let supabaseClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
    }
    supabaseClient = createClient(supabaseUrl, supabaseKey);
  }
  return supabaseClient;
}

// Legacy export for backward compatibility - use getSupabaseClient() instead
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as ReturnType<typeof createClient>;

// Course operations
export async function getCourseBySlug(slug: string, allowUnpublished = false) {
  const client = getSupabaseClient();
  let query = client
    .from("courses")
    .select("*")
    .eq("slug", slug);
  
  if (!allowUnpublished) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query.single();
  
  if (error) throw error;
  return data as Course;
}

export async function getAllCourses(publishedOnly = true) {
  const client = getSupabaseClient();
  let query = client.from("courses").select("*");
  
  if (publishedOnly) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
}

export async function getFeaturedCourses() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("courses")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
}

export async function getCoursesByCategory(category: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("courses")
    .select("*")
    .eq("published", true)
    .eq("category", category)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
}

export async function searchCourses(searchTerm: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("courses")
    .select("*")
    .eq("published", true)
    .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
}

export async function createCourse(course: Omit<Course, "id" | "created_at" | "updated_at">) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("courses") as any)
    .insert([course])
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function updateCourse(id: string, updates: Partial<Course>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("courses") as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(id: string) {
  const client = getSupabaseClient();
  const { error } = await client
    .from("courses")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

// Module operations
export async function getModulesByCourseId(courseId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("\"order\"", { ascending: true });
  
  if (error) throw error;
  return data as Module[];
}

export async function createModule(module: Omit<Module, "id" | "created_at" | "updated_at">) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("modules") as any)
    .insert([module])
    .select()
    .single();
  
  if (error) throw error;
  return data as Module;
}

export async function updateModule(id: string, updates: Partial<Module>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("modules") as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Module;
}

// Lesson operations
export async function getLessonsByModuleId(moduleId: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("\"order\"", { ascending: true });
  
  if (error) throw error;
  return data as Lesson[];
}

export async function getLessonWithContent(lessonId: string) {
  const client = getSupabaseClient();
  const { data: lesson, error: lessonError } = await client
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .single();
  
  if (lessonError) throw lessonError;
  
  const { data: content, error: contentError } = await client
    .from("lesson_content")
    .select("*")
    .eq("lesson_id", lessonId)
    .single();
  
  if (contentError && contentError.code !== "PGRST116") throw contentError;
  
  return {
    lesson: lesson as Lesson,
    content: content as LessonContent | null,
  };
}

export async function createLesson(lesson: Omit<Lesson, "id" | "created_at" | "updated_at">) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("lessons") as any)
    .insert([lesson])
    .select()
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

export async function updateLesson(id: string, updates: Partial<Lesson>) {
  const client = getSupabaseClient();
  const { data, error } = await (client.from("lessons") as any)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Lesson;
}

