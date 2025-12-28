"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { CourseBuilder } from "@/components/admin/CourseBuilder";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.id);
      fetchCourse(p.id);
    });
  }, [params]);

  const fetchCourse = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}`);
      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </Section>
    );
  }

  if (!course) {
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Course not found</p>
            <Link href="/admin/courses">
              <Button variant="outline" className="mt-4">
                Back to Courses
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  if (!courseId) {
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-7xl">
        <div className="mb-6">
          <Link href="/admin/courses">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <CourseBuilder courseId={courseId} initialCourse={course} onUpdate={fetchCourse} />
      </Container>
    </Section>
  );
}


