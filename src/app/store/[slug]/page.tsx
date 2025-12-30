import { Metadata } from "next";
import { getCourseBySlug, getModulesByCourseId } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Play, ShoppingCart, CheckCircle2 } from "lucide-react";
import { CourseHero } from "@/components/store/CourseHero";
import { CourseCurriculum } from "@/components/store/CourseCurriculum";

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
      description: course.short_description || course.description || undefined,
    };
  } catch (error) {
    return { title: "Course | EarnYour Marketing" };
  }
}

export default async function StoreCoursePage({ 
  params 
}: { 
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  let course;
  try {
    course = await getCourseBySlug(slug, false);
  } catch (error) {
    console.error("Error fetching course:", error);
    notFound();
  }
  
  if (!course || !course.published) {
    notFound();
  }

  let modules = [];
  try {
    modules = await getModulesByCourseId(course.id);
  } catch (error) {
    console.error("Error fetching modules:", error);
  }

  return (
    <>
      <CourseHero course={course} />
      
      {course.description && (
        <Section>
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-brand-navy mb-6">
                About This Course
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {modules.length > 0 && (
        <Section className="bg-muted/50">
          <Container>
            <CourseCurriculum course={course} modules={modules} />
          </Container>
        </Section>
      )}
    </>
  );
}

