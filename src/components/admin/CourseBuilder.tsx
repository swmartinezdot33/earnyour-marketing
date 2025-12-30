"use client";

import { useState, useEffect } from "react";
import { VisualCourseBuilder } from "./VisualCourseBuilder";
import { CourseMetadata } from "./CourseMetadata";
import { ModuleEditor } from "./ModuleEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { showToast } from "@/components/ui/toast";

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
        showToast(data.error || "Failed to update course", "error");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      showToast("Failed to update course. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleModuleUpdate = () => {
    fetchModules();
  };

  // Use the new VisualCourseBuilder for a modern, professional interface
  return (
    <VisualCourseBuilder
      courseId={courseId}
      initialCourse={course}
      onUpdate={onUpdate}
    />
  );
}


