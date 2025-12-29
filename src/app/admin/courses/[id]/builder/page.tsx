"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { CourseBuilder } from "@/components/admin/CourseBuilder";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function CourseBuilderPage({ params }: { params: Promise<{ id: string }> }) {
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
      } else {
        console.error("Failed to fetch course:", data.error);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <Container>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Link href="/admin/courses">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  if (!courseId) {
    return (
      <div className="p-8">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="p-8">
      <Container className="max-w-7xl">
        <div className="mb-6">
          <Link href="/admin/courses">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <CourseBuilder courseId={courseId} initialCourse={course} onUpdate={() => fetchCourse(courseId)} />
      </Container>
    </div>
  );
}


