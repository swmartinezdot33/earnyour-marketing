"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Settings } from "lucide-react";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [courseId, setCourseId] = useState<string>("");

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.id);
      // Fetch course data
      fetch(`/api/admin/courses/${p.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCourse(data.course);
          }
          setLoading(false);
        });
    });
  }, [params]);

  if (loading) {
    return (
      <Section className="pt-24 pb-16">
        <Container>Loading...</Container>
      </Section>
    );
  }

  if (!course) {
    return (
      <Section className="pt-24 pb-16">
        <Container>Course not found</Container>
      </Section>
    );
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <Link href="/admin/courses">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            {course.title}
          </h1>
          <p className="text-muted-foreground">{course.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Modules & Lessons</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Organize your course content into modules and lessons.
                </p>
                <Link href={`/admin/courses/${courseId}/modules`}>
                  <Button className="w-full mb-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Manage Modules
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground">
                  Add modules and lessons to build out your course content.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-1">Status</p>
                  <p className="text-sm text-muted-foreground">
                    {course.published ? "Published" : "Draft"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Price</p>
                  <p className="text-sm text-muted-foreground">${course.price}</p>
                </div>
                <Link href={`/admin/courses/${courseId}/ghl`}>
                  <Button variant="outline" className="w-full mb-2">
                    <Settings className="mr-2 h-4 w-4" />
                    GHL Integration
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </Section>
  );
}

