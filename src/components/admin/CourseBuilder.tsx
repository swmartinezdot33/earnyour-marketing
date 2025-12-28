"use client";

import { useState, useEffect } from "react";
import { CourseMetadata } from "./CourseMetadata";
import { ModuleEditor } from "./ModuleEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface CourseBuilderProps {
  courseId: string;
  initialCourse: any;
  onUpdate?: () => void;
}

export function CourseBuilder({ courseId, initialCourse, onUpdate }: CourseBuilderProps) {
  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (courseId) {
      fetchModules();
    }
  }, [courseId]);

  const fetchModules = async () => {
    if (!courseId) return;
    
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`);
      const data = await response.json();
      if (data.success) {
        setModules(data.modules);
      }
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const handleCourseUpdate = async (updates: any) => {
    if (!courseId) {
      console.error("Cannot update course: courseId is undefined");
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        setCourse(data.course);
        if (onUpdate) onUpdate();
      } else {
        console.error("Failed to update course:", data.error);
        alert(data.error || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleUpdate = () => {
    fetchModules();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
          {course.title}
        </h1>
        <p className="text-muted-foreground">Build and organize your course content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="overview">Course Overview</TabsTrigger>
          <TabsTrigger value="content">Course Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <CourseMetadata
            course={course}
            onUpdate={handleCourseUpdate}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <ModuleEditor
            courseId={courseId}
            courseTitle={course.title}
            modules={modules}
            onUpdate={handleModuleUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}


