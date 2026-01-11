import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { CourseLandingTemplate } from "@/components/courses/CourseLandingTemplate";

// Force dynamic rendering since we need Supabase and session data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { 
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const course = await getCourseBySlug(slug, false);
    
    if (!course) {
      return { title: "Course Not Found" };
    }

    return {
      title: `${course.title} | EarnYour Marketing`,
      description: course.short_description || course.description || `Learn ${course.title} with EarnYour Marketing`,
      openGraph: {
        title: course.title,
        description: course.short_description || course.description || undefined,
        type: "website",
        images: course.image_url ? [{ url: course.image_url }] : [],
      },
    };
  } catch (error) {
    return { title: "Course | EarnYour Marketing" };
  }
}

export default async function CourseLandingPage({ 
  params,
}: { 
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getSession();
  
  let course;
  try {
    course = await getCourseBySlug(slug, false);
  } catch (error) {
    console.error("Error fetching course:", error);
    notFound();
  }
  
  if (!course) {
    notFound();
  }
  
  // If course is unpublished, show 404
  if (!course.published) {
    notFound();
  }

  const enrolled = session ? await isUserEnrolled(session.userId, course.id) : false;

  return (
    <CourseLandingTemplate 
      course={course} 
      enrolled={enrolled}
      courseSlug={slug}
    />
  );
}
