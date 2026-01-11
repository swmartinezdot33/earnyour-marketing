"use client";

import { Course } from "@/lib/db/schema";
import { CourseLandingHero } from "@/components/courses/landing/CourseLandingHero";
import { CourseBenefits } from "@/components/courses/landing/CourseBenefits";
import { CourseFeatures } from "@/components/courses/landing/CourseFeatures";
import { CourseCurriculum } from "@/components/courses/landing/CourseCurriculum";
import { CourseFAQ } from "@/components/courses/landing/CourseFAQ";
import { CoursePricingCTA } from "@/components/courses/landing/CoursePricingCTA";

interface CourseLandingTemplateProps {
  course: Course;
  enrolled: boolean;
  courseSlug: string;
}

export function CourseLandingTemplate({
  course,
  enrolled,
  courseSlug,
}: CourseLandingTemplateProps) {
  // Extract benefits from description (split by newline or bullet points)
  const extractBenefits = (description: string | undefined): string[] => {
    if (!description) return [];
    
    // Split by common delimiters
    return description
      .split(/[\n•\-]/g)
      .map(item => item.trim())
      .filter(item => item.length > 0 && item.length < 150)
      .slice(0, 5);
  };

  const benefits = extractBenefits(course.description);

  return (
    <>
      {/* Hero Section */}
      <CourseLandingHero 
        course={course}
        enrolled={enrolled}
        courseSlug={courseSlug}
      />

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <CourseBenefits benefits={benefits} />
      )}

      {/* Features Section */}
      <CourseFeatures course={course} />

      {/* Curriculum Preview Section */}
      <CourseCurriculum courseId={course.id} />

      {/* FAQ Section */}
      {course.description && (
        <CourseFAQ courseTitle={course.title} />
      )}

      {/* Final Pricing CTA */}
      <CoursePricingCTA 
        course={course}
        enrolled={enrolled}
        courseSlug={courseSlug}
      />
    </>
  );
}
