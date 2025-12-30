import { Metadata } from "next";
import { getCourseBySlug, getLessonWithContent } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Lock } from "lucide-react";
import { CoursePreviewClient } from "@/components/store/CoursePreview";

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
      title: `Preview: ${course.title} | EarnYour Marketing`,
      description: course.short_description || course.description || undefined,
    };
  } catch (error) {
    return { title: "Course Preview | EarnYour Marketing" };
  }
}

export default async function CoursePreviewPage({ 
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

  if (!course.preview_lesson_id) {
    // No preview lesson, redirect to course page
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground mb-4">
                This course doesn't have a preview lesson available.
              </p>
              <Button asChild>
                <Link href={`/store/${slug}`}>View Course Details</Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </Section>
    );
  }

  let previewLesson;
  try {
    const lessonData = await getLessonWithContent(course.preview_lesson_id);
    previewLesson = lessonData;
  } catch (error) {
    console.error("Error fetching preview lesson:", error);
    previewLesson = null;
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link 
              href={`/store/${slug}`}
              className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
            >
              ← Back to Course
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-2">
              {course.title} - Preview
            </h1>
            <p className="text-muted-foreground">
              {course.short_description || course.description}
            </p>
          </div>

          {previewLesson ? (
            <CoursePreviewClient 
              course={course}
              lesson={previewLesson.lesson}
              content={previewLesson.content}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-16">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Preview lesson not available.
                </p>
                <Button asChild>
                  <Link href={`/store/${slug}`}>View Course Details</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </Container>
    </Section>
  );
}

