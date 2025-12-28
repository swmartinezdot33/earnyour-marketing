import { Metadata } from "next";
import { getCourseBySlug } from "@/lib/db/courses";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/db/enrollments";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  
  if (!course) {
    return { title: "Course Not Found" };
  }

  return {
    title: `Purchase Successful: ${course.title} | EarnYour Marketing`,
  };
}

export default async function CourseSuccessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  const session = await getSession();
  
  if (!course) {
    notFound();
  }

  if (!session) {
    redirect(`/login?redirect=/courses/${slug}/success`);
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold font-heading text-brand-navy mb-2">
                Enrollment Successful!
              </h1>
              <p className="text-muted-foreground">
                You've successfully enrolled in <strong>{course.title}</strong>
              </p>
            </div>
            <a href={`/courses/${slug}/learn`}>
              <button className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors">
                Start Learning
              </button>
            </a>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}







