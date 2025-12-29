"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface CoursePreviewProps {
  courseId: string;
  course: any;
  modules: any[];
}

export function CoursePreview({ courseId, course, modules }: CoursePreviewProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [moduleLessons, setModuleLessons] = useState<Record<string, any[]>>({});
  const [loadingLessons, setLoadingLessons] = useState<Set<string>>(new Set());

  const toggleModule = async (moduleId: string) => {
    if (expandedModules.has(moduleId)) {
      setExpandedModules((prev) => {
        const next = new Set(prev);
        next.delete(moduleId);
        return next;
      });
    } else {
      setExpandedModules((prev) => new Set([...prev, moduleId]));
      
      if (!moduleLessons[moduleId]) {
        setLoadingLessons((prev) => new Set([...prev, moduleId]));
        try {
          const response = await fetch(`/api/admin/modules/${moduleId}/lessons`);
          const data = await response.json();
          if (data.success) {
            setModuleLessons((prev) => ({
              ...prev,
              [moduleId]: data.lessons,
            }));
          }
        } catch (error) {
          console.error("Error fetching lessons:", error);
        } finally {
          setLoadingLessons((prev) => {
            const next = new Set(prev);
            next.delete(moduleId);
            return next;
          });
        }
      }
    }
  };

  const totalLessons = modules.reduce((acc, m) => acc + (moduleLessons[m.id]?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy/80 text-white p-8 rounded-xl">
        <div className="max-w-4xl mx-auto">
          {course.image_url && (
            <div className="mb-6 aspect-video rounded-lg overflow-hidden">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <h1 className="text-4xl font-bold font-heading mb-4">{course.title}</h1>
          {course.short_description && (
            <p className="text-xl text-white/90 mb-4">{course.short_description}</p>
          )}
          <div className="flex items-center gap-6 text-white/80">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span>{modules.length} Modules</span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              <span>{totalLessons} Lessons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">${course.price}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Description */}
      {course.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Course</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-line text-muted-foreground">{course.description}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Course Content */}
      <Card>
        <CardHeader>
          <CardTitle>Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modules.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No modules yet. Add modules to build your course.
              </p>
            ) : (
              modules.map((module, index) => (
                <div key={module.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="font-semibold">{module.title}</h3>
                        {module.description && (
                          <p className="text-sm text-muted-foreground">{module.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {moduleLessons[module.id]?.length || 0} lessons
                      </span>
                      <Button variant="ghost" size="sm">
                        {expandedModules.has(module.id) ? "Hide" : "Show"} Lessons
                      </Button>
                    </div>
                  </button>

                  {expandedModules.has(module.id) && (
                    <div className="border-t bg-muted/20 p-4">
                      {loadingLessons.has(module.id) ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {moduleLessons[module.id]?.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No lessons in this module yet.
                            </p>
                          ) : (
                            moduleLessons[module.id]?.map((lesson, lessonIndex) => (
                              <div
                                key={lesson.id}
                                className="flex items-center gap-3 p-3 bg-background rounded-lg"
                              >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                                  {lessonIndex + 1}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{lesson.title}</h4>
                                  {lesson.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                      {lesson.description}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground capitalize">
                                    {lesson.content_type}
                                  </span>
                                  {lesson.duration_minutes && (
                                    <span className="text-xs text-muted-foreground">
                                      • {lesson.duration_minutes} min
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Actions */}
      <div className="flex justify-center gap-4">
        <Link href={`/courses/${course.slug}`} target="_blank">
          <Button size="lg">
            View Live Course
          </Button>
        </Link>
        <Link href={`/admin/courses/${courseId}/builder`}>
          <Button variant="outline" size="lg">
            Back to Builder
          </Button>
        </Link>
      </div>
    </div>
  );
}

