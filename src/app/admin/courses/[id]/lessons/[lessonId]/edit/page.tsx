"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { LessonContentEditor } from "@/components/admin/LessonContentEditor";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function LessonEditPage({ params }: { params: Promise<{ id: string; lessonId: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [lessonId, setLessonId] = useState<string>("");
  const [lesson, setLesson] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.id);
      setLessonId(p.lessonId);
      fetchLesson(p.lessonId);
    });
  }, [params]);

  const fetchLesson = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/lessons/${id}/content`);
      const data = await response.json();
      if (data.success) {
        setLesson(data.lesson);
        setContent(data.content);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lesson:", error);
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

  if (!lesson) {
    return (
      <Section className="pt-24 pb-16">
        <Container>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Lesson not found</p>
            <Link href={`/admin/courses/${courseId}/builder`}>
              <Button variant="outline" className="mt-4">
                Back to Builder
              </Button>
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-6xl">
        <div className="mb-6">
          <Link href={`/admin/courses/${courseId}/builder`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course Builder
            </Button>
          </Link>
        </div>

        <LessonContentEditor
          courseId={courseId}
          lesson={lesson}
          content={content}
          onUpdate={() => fetchLesson(lessonId)}
        />
      </Container>
    </Section>
  );
}

