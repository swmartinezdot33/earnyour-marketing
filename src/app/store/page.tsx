import { Metadata } from "next";
import { getAllCourses, getFeaturedCourses } from "@/lib/db/courses";
import { getAllBundles, getFeaturedBundles } from "@/lib/db/bundles";
import { FeaturedCourses } from "@/components/store/FeaturedCourses";
import { CourseGrid } from "@/components/store/CourseGrid";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CourseBundleCard } from "@/components/store/CourseBundleCard";
import type { Course } from "@/lib/db/schema";
import type { CourseBundle } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "Course Store | EarnYour Marketing",
  description: "Browse and purchase professional marketing courses. Learn SEO, Google Ads, Facebook Ads, CRM automation, and more.",
};

// Force dynamic rendering since we need Supabase data
export const dynamic = 'force-dynamic';

export default async function StorePage() {
  let allCourses: Course[] = [];
  let featuredCourses: Course[] = [];
  let allBundles: CourseBundle[] = [];
  let featuredBundles: CourseBundle[] = [];

  try {
    [allCourses, featuredCourses, allBundles, featuredBundles] = await Promise.all([
      getAllCourses(true), // Published only
      getFeaturedCourses(),
      getAllBundles(true), // Published only
      getFeaturedBundles(),
    ]);
  } catch (error) {
    console.error("Error fetching courses/bundles:", error);
    // Continue with empty arrays if fetch fails
  }

  return (
    <>
      {/* Hero Section */}
      <Section className="pt-24 pb-12 bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
              Learn Marketing That Works
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Professional courses taught by industry experts. Master SEO, paid advertising, 
              CRM automation, and grow your business with proven strategies.
            </p>
          </div>
        </Container>
      </Section>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <FeaturedCourses courses={featuredCourses} />
      )}

      {/* Featured Bundles */}
      {featuredBundles.length > 0 && (
        <Section className="bg-muted/50">
          <Container>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-4">
                Course Bundles
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Save money by purchasing multiple courses together
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBundles.map((bundle) => (
                <CourseBundleCard key={bundle.id} bundle={bundle} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* All Courses Grid */}
      <CourseGrid courses={allCourses} />
    </>
  );
}

