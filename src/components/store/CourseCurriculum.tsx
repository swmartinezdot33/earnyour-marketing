"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, CheckCircle2 } from "lucide-react";
import type { Course, Module } from "@/lib/db/schema";

interface CourseCurriculumProps {
  course: Course;
  modules: Module[];
}

export function CourseCurriculum({ course, modules }: CourseCurriculumProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold font-heading text-brand-navy mb-8">
        Course Curriculum
      </h2>
      <div className="space-y-4">
        {modules.map((module, index) => (
          <Card key={module.id}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-navy text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <CardTitle className="flex-1">{module.title}</CardTitle>
                <Lock className="h-5 w-5 text-muted-foreground" />
              </div>
              {module.description && (
                <p className="text-sm text-muted-foreground mt-2 ml-11">
                  {module.description}
                </p>
              )}
            </CardHeader>
            <CardContent className="ml-11">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Enroll to view lessons</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <Lock className="h-4 w-4 inline mr-2" />
          Full curriculum details are available after enrollment.
        </p>
      </div>
    </div>
  );
}

