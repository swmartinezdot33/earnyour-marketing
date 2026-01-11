"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Loader2 } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
}

interface CourseCurriculumProps {
  courseId: string;
}

export function CourseCurriculum({ courseId }: CourseCurriculumProps) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/modules`);
        if (response.ok) {
          const data = await response.json();
          setModules(data.sort((a: Module, b: Module) => a.order - b.order));
        }
      } catch (error) {
        console.error("Error fetching modules:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, [courseId]);

  if (loading) {
    return (
      <Section id="curriculum">
        <Container>
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </Container>
      </Section>
    );
  }

  if (modules.length === 0) {
    return null;
  }

  return (
    <Section id="curriculum">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-12 text-center">
            Course Curriculum
          </h2>
          <div className="space-y-4">
            {modules.map((module, index) => (
              <Card key={module.id} className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl text-brand-navy">
                        {module.title}
                      </CardTitle>
                      {module.description && (
                        <p className="text-sm text-brand-navy/70 mt-2">
                          {module.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
