import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllCourses } from "@/lib/db/courses";
import type { Course } from "@/lib/db/schema";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { EnhancedCourseList } from "@/components/admin/EnhancedCourseList";
import { StripeWarningBanner } from "@/components/admin/StripeWarningBanner";

export const metadata: Metadata = {
  title: "Admin - Courses | EarnYour Marketing",
  description: "Manage your courses",
};

// Force dynamic rendering since we need Supabase and session data
export const dynamic = 'force-dynamic';

export default async function AdminCoursesPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  let courses: Course[] = [];
  try {
    courses = await getAllCourses(false); // Get all courses, including unpublished
  } catch (error) {
    console.error("Error fetching courses:", error);
    // Continue with empty courses array if fetch fails
  }

  return (
    <div className="p-8">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
              Course Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage your training courses with advanced filtering and analytics
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin/courses/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Stripe Warning Banner */}
        <StripeWarningBanner className="mb-6" />

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
          <EnhancedCourseList initialCourses={courses} />
        )}
      </Container>
    </div>
  );
}

