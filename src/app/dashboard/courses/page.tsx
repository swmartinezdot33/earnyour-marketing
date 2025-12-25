import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserEnrollments } from "@/lib/db/enrollments";
import { validateGHLMembership } from "@/lib/auth/course-access";
import { getUserById } from "@/lib/db/users";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "My Courses | EarnYour Marketing",
  description: "Your enrolled courses",
};

export default async function MyCoursesPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const enrollments = await getUserEnrollments(session.userId);
  const user = await getUserById(session.userId);
  const membership = user ? await validateGHLMembership(session.userId) : null;

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
              My Courses
            </h1>
            {membership && membership.status !== "unknown" && (
              <p className="text-muted-foreground">
                Membership: <span className="font-semibold capitalize">{membership.status}</span>
                {membership.tier && (
                  <span className="ml-2">({membership.tier})</span>
                )}
              </p>
            )}
          </div>
        </div>

        {enrollments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Browse our course catalog to start learning.
              </p>
              <Link href="/courses">
                <Button>
                  Browse Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment: any) => (
              <Link key={enrollment.id} href={`/courses/${enrollment.course.slug}/learn`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle>{enrollment.course.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {enrollment.course.short_description || enrollment.course.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

