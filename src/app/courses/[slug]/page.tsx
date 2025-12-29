import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { StudentNav } from "@/components/layout/StudentNav";
import Link from "next/link";

// Force dynamic rendering since we need Supabase and session data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { preview } = await searchParams;
  try {
    const course = await getCourseBySlug(slug, preview === "true");
    
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

export default async function CoursePage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const session = await getSession();
  
  // Only allow preview mode for admins
  const allowPreview = preview === "true" && session?.role === "admin";
  
  let course;
  try {
    course = await getCourseBySlug(slug, allowPreview);
  } catch (error) {
    console.error("Error fetching course:", error);
    notFound();
  }
  
  if (!course) {
    notFound();
  }
  
  // If course is unpublished and not in preview mode, show 404
  if (!course.published && !allowPreview) {
    notFound();
  }

  const enrolled = session ? await isUserEnrolled(session.userId, course.id) : false;

  // If in preview mode and user is admin, use student portal layout
  if (allowPreview) {
    return (
      <div className="min-h-screen bg-background">
        {/* Student Header */}
        <header className="border-b bg-card">
          <Container>
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-6">
                <Link href="/admin/courses" className="text-xl font-bold text-brand-navy">
                  Course Preview
                </Link>
                <span className="text-sm text-muted-foreground bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Preview Mode
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{session?.email}</span>
                </div>
                <Link href={`/admin/courses/${course.id}/builder`}>
                  <Button variant="outline" size="sm">
                    Back to Builder
                  </Button>
                </Link>
              </div>
            </div>
          </Container>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-6">
            <StudentNav />
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-gradient-to-r from-brand-navy to-brand-navy/80 text-white p-8 rounded-xl">
                <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                  {course.title}
                </h1>
                <p className="text-xl text-white/80 mb-8">
                  {course.short_description || course.description}
                </p>
              </div>

              {course.description && (
                <div className="bg-card border rounded-lg p-6">
                  <h2 className="text-3xl font-bold font-heading text-brand-navy mb-6">
                    About This Course
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-muted-foreground whitespace-pre-line">
                      {course.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Preview Mode:</strong> You are viewing this course as it would appear to students. 
                  The regular website header and footer are hidden to simulate the student portal experience.
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <Section className="bg-brand-navy text-white pt-24 pb-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                {course.title}
              </h1>
              <p className="text-xl text-white/80 mb-8">
                {course.short_description || course.description}
              </p>
              <div className="flex gap-4">
                {enrolled ? (
                  <Link href={`/courses/${slug}/learn`}>
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Continue Learning
                    </Button>
                  </Link>
                ) : (
                  <PurchaseButton courseId={course.id} price={course.price} />
                )}
              </div>
            </div>
            {course.image_url && (
              <div className="aspect-video rounded-xl overflow-hidden">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </Container>
      </Section>

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
    </>
  );
}

