import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/db/courses";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import Link from "next/link";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  
  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `${course.title} | EarnYour Marketing`,
    description: course.short_description || course.description || undefined,
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const session = await getSession();
  
  if (!course) {
    notFound();
  }

  const enrolled = session ? await isUserEnrolled(session.userId, course.id) : false;

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

