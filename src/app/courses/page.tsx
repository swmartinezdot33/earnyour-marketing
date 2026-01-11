import { Metadata } from "next";
import { getAllCourses } from "@/lib/db/courses";
import type { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/auth";
import { isUserEnrolled } from "@/lib/db/enrollments";

export const metadata: Metadata = {
  title: "Courses | EarnYour Marketing",
  description: "Browse our training courses",
};

// Force dynamic rendering since we need Supabase and session data
export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  let courses: Course[] = [];
  try {
    courses = await getAllCourses(true); // Published only
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Continue with empty courses array if fetch fails
  }
  
  const session = await getSession();

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-4">
            Training Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn from industry experts and master the skills you need to grow your business.
          </p>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(async (course) => {
              const enrolled = session ? await isUserEnrolled(session.userId, course.id) : false;
              
              return (
                <Card key={course.id} className="h-full flex flex-col">
                  {course.image_url && (
                    <div className="aspect-video bg-muted rounded-t-xl overflow-hidden">
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle>{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {course.short_description || course.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-brand-navy">
                        ${course.price}
                      </span>
                      <Link href={enrolled ? `/courses/${course.slug}/learn` : `/courses/${course.slug}/landing`}>
                        <Button>
                          {enrolled ? "Continue" : "View Course"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </Section>
  );
}







