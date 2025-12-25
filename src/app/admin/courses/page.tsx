import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/db/courses";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin - Courses | EarnYour Marketing",
  description: "Manage your courses",
};

export default async function AdminCoursesPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const courses = await getAllCourses(false); // Get all courses, including unpublished

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage your training courses
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/whitelabel">
              <Button variant="outline">
                Whitelabel Accounts
              </Button>
            </Link>
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first course to start teaching and earning.
              </p>
              <Link href="/admin/courses/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/admin/courses/${course.id}/edit`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <CardTitle className="text-xl">{course.title}</CardTitle>
                      {!course.published && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {course.short_description || course.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-brand-navy">
                        ${course.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {course.published ? "Published" : "Draft"}
                      </span>
                    </div>
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

