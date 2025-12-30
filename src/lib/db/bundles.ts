import { getSupabaseClient } from "./courses";
import type { CourseBundle, Course } from "./schema";

export async function getAllBundles(publishedOnly = true) {
  const client = getSupabaseClient();
  let query = client.from("course_bundles").select("*");
  
  if (publishedOnly) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query.order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as CourseBundle[];
}

export async function getBundleById(id: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("course_bundles")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data as CourseBundle;
}

export async function getBundleBySlug(slug: string, allowUnpublished = false) {
  const client = getSupabaseClient();
  let query = client
    .from("course_bundles")
    .select("*")
    .eq("slug", slug);
  
  if (!allowUnpublished) {
    query = query.eq("published", true);
  }
  
  const { data, error } = await query.single();
  
  if (error) throw error;
  return data as CourseBundle;
}

export async function getFeaturedBundles() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from("course_bundles")
    .select("*")
    .eq("published", true)
    .eq("featured", true)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data as CourseBundle[];
}

export async function getBundleWithCourses(bundleId: string) {
  const bundle = await getBundleById(bundleId);
  const client = getSupabaseClient();
  
  if (!bundle.course_ids || bundle.course_ids.length === 0) {
    return { bundle, courses: [] };
  }
  
  const { data: courses, error } = await client
    .from("courses")
    .select("*")
    .in("id", bundle.course_ids);
  
  if (error) throw error;
  
  return {
    bundle,
    courses: (courses || []) as Course[],
  };
}

export async function calculateBundleSavings(bundle: CourseBundle) {
  const { courses } = await getBundleWithCourses(bundle.id);
  const totalIndividualPrice = courses.reduce((sum, course) => sum + course.price, 0);
  const savings = totalIndividualPrice - bundle.price;
  const savingsPercentage = totalIndividualPrice > 0 
    ? Math.round((savings / totalIndividualPrice) * 100) 
    : 0;
  
  return {
    totalIndividualPrice,
    bundlePrice: bundle.price,
    savings,
    savingsPercentage,
  };
}

