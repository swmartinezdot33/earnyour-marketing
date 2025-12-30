import { cache } from "react";
import { getSupabaseClient } from "./courses";
import type { Course, Module, Lesson, LessonContent } from "./schema";

// React cache for server-side request deduplication
// This ensures the same query within a single request is only executed once
export const getCourseBySlugCached = cache(async (slug: string, allowUnpublished = false) => {
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
});

export const getAllCoursesCached = cache(async (publishedOnly = true) => {
  const client = getSupabaseClient();
  let query = client.from("courses").select("*");
  
  if (publishedOnly) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as Course[];
});

// Optimized: Get course with all modules and lessons in a single query (by slug)
export const getCourseWithModulesAndLessons = cache(async (slug: string) => {
  const client = getSupabaseClient();
  
  // Fetch course by slug
  const { data: courseData, error: courseError } = await client
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  
  if (courseError) throw courseError;
  if (!courseData) throw new Error("Course not found");
  
  const course = courseData as Course;
  
  // Fetch all modules for this course
  const { data: modulesData, error: modulesError } = await client
    .from("modules")
    .select("*")
    .eq("course_id", course.id)
    .order("\"order\"", { ascending: true });
  
  if (modulesError) throw modulesError;
  
  if (!modulesData || modulesData.length === 0) {
    return {
      course,
      modules: [],
    };
  }
  
  const modules = modulesData as Module[];
  
  // Fetch all lessons for all modules in parallel (single query)
  const moduleIds = modules.map(m => m.id);
  const { data: lessonsData, error: lessonsError } = await client
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds)
    .order("\"order\"", { ascending: true });
  
  if (lessonsError) throw lessonsError;
  
  const lessons = (lessonsData || []) as Lesson[];
  
  // Group lessons by module_id
  const lessonsByModule = new Map<string, Lesson[]>();
  lessons.forEach(lesson => {
    if (!lessonsByModule.has(lesson.module_id)) {
      lessonsByModule.set(lesson.module_id, []);
    }
    lessonsByModule.get(lesson.module_id)!.push(lesson);
  });
  
  // Attach lessons to modules
  const modulesWithLessons = modules.map(module => ({
    ...module,
    lessons: lessonsByModule.get(module.id) || [],
  }));
  
  return {
    course,
    modules: modulesWithLessons,
  };
});

// Optimized: Get modules with lessons in a single query
export const getModulesWithLessons = cache(async (courseId: string) => {
  const client = getSupabaseClient();
  
  // Fetch all modules for this course
  const { data: modulesData, error: modulesError } = await client
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("\"order\"", { ascending: true });
  
  if (modulesError) throw modulesError;
  
  if (!modulesData || modulesData.length === 0) {
    return [];
  }
  
  const modules = modulesData as Module[];
  
  // Fetch all lessons for all modules in parallel (single query)
  const moduleIds = modules.map(m => m.id);
  const { data: lessonsData, error: lessonsError } = await client
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds)
    .order("\"order\"", { ascending: true });
  
  if (lessonsError) throw lessonsError;
  
  const lessons = (lessonsData || []) as Lesson[];
  
  // Group lessons by module_id
  const lessonsByModule = new Map<string, Lesson[]>();
  lessons.forEach(lesson => {
    if (!lessonsByModule.has(lesson.module_id)) {
      lessonsByModule.set(lesson.module_id, []);
    }
    lessonsByModule.get(lesson.module_id)!.push(lesson);
  });
  
  // Attach lessons to modules
  return modules.map(module => ({
    ...module,
    lessons: lessonsByModule.get(module.id) || [],
  }));
});

// Optimized: Get course by ID with cache
export const getCourseByIdCached = cache(async (courseId: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();
  
  if (error) throw error;
  return data as Course;
});

// Optimized: Get modules by course ID with cache
export const getModulesByCourseIdCached = cache(async (courseId: string) => {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("\"order\"", { ascending: true });
  
  if (error) throw error;
  return data as Module[];
});

// Optimized: Get all lessons for multiple modules in one query
export const getLessonsByModuleIds = cache(async (moduleIds: string[]) => {
  if (moduleIds.length === 0) return [];
  
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("lessons")
    .select("*")
    .in("module_id", moduleIds)
    .order("\"order\"", { ascending: true });
  
  if (error) throw error;
  return data as Lesson[];
});

