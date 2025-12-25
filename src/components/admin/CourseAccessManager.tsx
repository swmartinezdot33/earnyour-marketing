"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { Enrollment } from "@/lib/db/schema";

interface Course {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

interface CourseAccessManagerProps {
  userId: string;
  courses: Course[];
  enrollments: (Enrollment & { course: any })[];
}

export function CourseAccessManager({
  userId,
  courses,
  enrollments,
}: CourseAccessManagerProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    new Set(enrollments.map((e) => e.course_id))
  );

  const handleToggleAccess = async (courseId: string, grantAccess: boolean) => {
    setLoading(courseId);
    try {
      const response = await fetch(`/api/admin/users/${userId}/access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId,
          grantAccess,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update course access");
      }

      // Update local state
      if (grantAccess) {
        setEnrolledCourseIds((prev) => new Set([...prev, courseId]));
      } else {
        setEnrolledCourseIds((prev) => {
          const next = new Set(prev);
          next.delete(courseId);
          return next;
        });
      }
    } catch (error) {
      console.error("Error updating course access:", error);
      alert(error instanceof Error ? error.message : "Failed to update course access");
    } finally {
      setLoading(null);
    }
  };

  if (courses.length === 0) {
    return <p className="text-muted-foreground">No courses available</p>;
  }

  return (
    <div className="space-y-3">
      {courses.map((course) => {
        const isEnrolled = enrolledCourseIds.has(course.id);
        const isLoading = loading === course.id;

        return (
          <div
            key={course.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3 flex-1">
              <Checkbox
                checked={isEnrolled}
                onCheckedChange={(checked) => {
                  handleToggleAccess(course.id, checked === true);
                }}
                disabled={isLoading}
              />
              <div className="flex-1">
                <p className="font-semibold">{course.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {!course.published && (
                    <Badge variant="secondary" className="text-xs">
                      Draft
                    </Badge>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {course.slug}
                  </p>
                </div>
              </div>
            </div>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>
        );
      })}
    </div>
  );
}

