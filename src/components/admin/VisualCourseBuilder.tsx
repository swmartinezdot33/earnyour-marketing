"use client";

import { useState, useEffect } from "react";
import { CourseMetadata } from "./CourseMetadata";
import { VisualModuleEditor } from "./VisualModuleEditor";
import { CoursePreview } from "./CoursePreview";
import { CourseAnalytics } from "./CourseAnalytics";
import { StripeProductSelector } from "./StripeProductSelector";
import { StripeWarningBanner } from "./StripeWarningBanner";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, Layout, FileText, Eye, Settings, BarChart3 } from "lucide-react";

interface VisualCourseBuilderProps {
  courseId: string;
  initialCourse: any;
  onUpdate?: () => void;
}

export function VisualCourseBuilder({ courseId, initialCourse, onUpdate }: VisualCourseBuilderProps) {
  const [course, setCourse] = useState(initialCourse);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  const [previewMode, setPreviewMode] = useState(false);

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
    if (onUpdate) onUpdate();
  };

  return (
    <div className="space-y-6">
      {/* Stripe Warning Banner */}
      <StripeWarningBanner />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            {course.title || "Untitled Course"}
          </h1>
          <p className="text-muted-foreground">
            Build your course content with our intuitive visual builder
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? "Exit Preview" : "Preview"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto">
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-4">
            {/* Sidebar - Course Info */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <div className="p-4 space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Course Status</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {course.published ? "Published" : "Draft"}
                      </span>
                      <Button
                        variant={course.published ? "default" : "outline"}
                        size="sm"
                        onClick={async () => {
                          // Check Stripe before publishing
                          if (!course.published) {
                            try {
                              const response = await fetch("/api/admin/stripe/status");
                              const data = await response.json();
                              
                              let warningMessage = "";
                              if (!data.configured) {
                                warningMessage = "Stripe is not configured. Courses cannot accept payments.";
                              } else if (!course.stripe_product_id) {
                                warningMessage = "This course is not linked to a Stripe product. Students won't be able to purchase it.";
                              }
                              
                              if (warningMessage) {
                                const confirmed = confirm(
                                  warningMessage + "\n\n" +
                                  "Do you want to publish anyway? (Configure in Settings)"
                                );
                                if (!confirmed) return;
                              }
                            } catch (error) {
                              console.error("Error checking Stripe:", error);
                            }
                          }
                          handleCourseUpdate({ published: !course.published });
                        }}
                      >
                        {course.published ? "Published" : "Draft"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Price</h3>
                    <p className="text-2xl font-bold text-brand-navy">${course.price || 0}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Structure</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Modules:</span>
                        <span className="font-medium">{modules.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Lessons:</span>
                        <span className="font-medium">
                          {modules.reduce((acc, m) => acc + (m.lesson_count || 0), 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Builder Area */}
            <div className="lg:col-span-3">
              <VisualModuleEditor
                courseId={courseId}
                courseTitle={course.title}
                modules={modules}
                onUpdate={handleModuleUpdate}
                previewMode={previewMode}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <CoursePreview courseId={courseId} course={course} modules={modules} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <CourseAnalytics courseId={courseId} />
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <CourseMetadata
            course={course}
            onUpdate={handleCourseUpdate}
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            <Card>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Course Settings</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Publishing</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Control when and how your course is visible to students.
                    </p>
                    <Button
                      variant={course.published ? "default" : "outline"}
                      onClick={() => handleCourseUpdate({ published: !course.published })}
                    >
                      {course.published ? "Unpublish Course" : "Publish Course"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <StripeProductSelector
              courseId={courseId}
              currentProductId={course.stripe_product_id}
              currentPriceId={course.stripe_price_id}
              courseTitle={course.title}
              coursePrice={course.price}
              courseDescription={course.description || course.short_description}
              onProductLinked={async (productId, priceId) => {
                await handleCourseUpdate({
                  stripe_product_id: productId || null,
                  stripe_price_id: priceId || null,
                });
                // Refresh course data
                if (onUpdate) onUpdate();
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

