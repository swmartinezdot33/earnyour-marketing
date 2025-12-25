import { Metadata } from "next";
import { getCourseBySlug, getModulesByCourseId } from "@/lib/db/courses";
import { getLessonsByModuleId, getLessonWithContent } from "@/lib/db/courses";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { checkCourseAccessBySlug, validateGHLMembership } from "@/lib/auth/course-access";
import { getLessonProgress, getUserProgressForCourse } from "@/lib/db/progress";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AccessStatus } from "@/components/courses/AccessStatus";
import Link from "next/link";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  
  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `Learn: ${course.title} | EarnYour Marketing`,
  };
}

export default async function CourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const session = await getSession();
  
  if (!course) {
    notFound();
  }

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}/learn`);
  }

  // Check access via both database and GHL
  const accessResult = await checkCourseAccessBySlug(session.userId, slug);
  
  if (!accessResult.hasAccess) {
    redirect(`/courses/${slug}?error=access_denied`);
  }

  // Get membership info
  const membership = await validateGHLMembership(session.userId);

  const modules = await getModulesByCourseId(course.id);
  
  // Fetch lessons for each module
  const modulesWithLessons = await Promise.all(
    modules.map(async (module) => {
      const lessons = await getLessonsByModuleId(module.id);
      return { ...module, lessons };
    })
  );

  // Get user progress
  const userProgress = await getUserProgressForCourse(session.userId, course.id);
  const progressMap = new Map(userProgress.map((p) => [p.lesson_id, p]));

  // Find first incomplete lesson or first lesson
  let firstLessonId: string | null = null;
  for (const module of modulesWithLessons) {
    for (const lesson of module.lessons) {
      const progress = progressMap.get(lesson.id);
      if (!progress || !progress.completed) {
        firstLessonId = lesson.id;
        break;
      }
    }
    if (firstLessonId) break;
  }

  if (!firstLessonId && modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
    firstLessonId = modulesWithLessons[0].lessons[0].id;
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            {course.title}
          </h1>
          <p className="text-muted-foreground mb-4">{course.description}</p>
          <AccessStatus
            hasAccess={accessResult.hasAccess}
            source={accessResult.source}
            membershipStatus={membership.status}
            membershipTier={membership.tier}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {firstLessonId ? (
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  Select a lesson from the sidebar to begin learning
                </p>
                <Link href={`/courses/${slug}/learn/${firstLessonId}`}>
                  <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Start Learning
                  </button>
                </Link>
              </div>
            ) : (
              <div className="bg-muted rounded-lg p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  No lessons available yet. Check back soon!
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {modulesWithLessons.map((module: any) => (
                  <div key={module.id} className="space-y-2">
                    <h3 className="font-semibold text-sm">{module.title}</h3>
                    <div className="space-y-1 pl-2">
                      {module.lessons.map((lesson: any) => {
                        const progress = progressMap.get(lesson.id);
                        const completed = progress?.completed || false;
                        return (
                          <Link
                            key={lesson.id}
                            href={`/courses/${slug}/learn/${lesson.id}`}
                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                            )}
                            <span className={completed ? "line-through opacity-60" : ""}>
                              {lesson.title}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

