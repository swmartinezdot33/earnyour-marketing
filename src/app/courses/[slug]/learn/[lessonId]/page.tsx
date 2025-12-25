import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/db/courses";
import { getLessonWithContent } from "@/lib/db/courses";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { checkCourseAccessBySlug } from "@/lib/auth/course-access";
import { getLessonProgress, updateLessonProgress } from "@/lib/db/progress";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { LessonPlayer } from "@/components/courses/LessonPlayer";

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lessonId: string }> }): Promise<Metadata> {
  const { lessonId } = await params;
  const { lesson } = await getLessonWithContent(lessonId);
  
  if (!lesson) {
    return { title: "Lesson Not Found" };
  }

  return {
    title: `${lesson.title} | EarnYour Marketing`,
  };
}

export default async function LessonPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  const course = await getCourseBySlug(slug);
  const session = await getSession();
  
  if (!course) {
    notFound();
  }

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}/learn/${lessonId}`);
  }

  // Check access via both database and GHL
  const accessResult = await checkCourseAccessBySlug(session.userId, slug);
  
  if (!accessResult.hasAccess) {
    redirect(`/courses/${slug}?error=access_denied`);
  }

  const { lesson, content } = await getLessonWithContent(lessonId);
  
  if (!lesson) {
    notFound();
  }

  const progress = await getLessonProgress(session.userId, lessonId);

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-6">
          <Link href={`/courses/${slug}/learn`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-3xl font-bold font-heading text-brand-navy mb-2">
            {lesson.title}
          </h1>
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-6">
              <LessonPlayer
                lesson={lesson}
                content={content}
                progress={progress}
                userId={session.userId}
                courseSlug={slug}
              />
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

