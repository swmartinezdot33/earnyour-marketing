"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface CourseMetadataProps {
  course: any;
  onUpdate: (updates: any) => void;
  loading?: boolean;
}

export function CourseMetadata({ course, onUpdate, loading }: CourseMetadataProps) {
  const [formData, setFormData] = useState({
    title: course.title || "",
    slug: course.slug || "",
    short_description: course.short_description || "",
    description: course.description || "",
    price: course.price?.toString() || "0",
    image_url: course.image_url || "",
  });
  const [aiGenerating, setAiGenerating] = useState<string | null>(null);
  const [publishConfirm, setPublishConfirm] = useState<{ open: boolean; warningMessage: string }>({ open: false, warningMessage: "" });

  // Sync formData when course prop changes
  useEffect(() => {
    setFormData({
      title: course.title || "",
      slug: course.slug || "",
      short_description: course.short_description || "",
      description: course.description || "",
      price: course.price?.toString() || "0",
      image_url: course.image_url || "",
    });
  }, [course]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "title") {
        updated.slug = generateSlug(value);
      }
      return updated;
    });
  };

  const handleSave = () => {
    onUpdate({
      ...formData,
      price: parseFloat(formData.price),
    });
  };

  const handleTogglePublished = async () => {
    // Check Stripe status and product linking before publishing
    if (!course.published) {
      try {
        const response = await fetch("/api/admin/stripe/status");
        const data = await response.json();
        
        let warningMessage = "";
        if (!data.configured) {
          warningMessage = "Stripe is not configured. Courses without Stripe integration cannot accept payments.";
        } else if (!course.stripe_product_id) {
          warningMessage = "This course is not linked to a Stripe product. Students won't be able to purchase it.";
        }
        
        if (warningMessage) {
          setPublishConfirm({ open: true, warningMessage });
          return;
        }
      } catch (error) {
        console.error("Error checking Stripe status:", error);
        // Continue with publish if check fails
      }
    }
    
    onUpdate({
      published: !course.published,
    });
  };

  const handleAIGenerate = async (field: "title" | "short_description" | "description") => {
    setAiGenerating(field);
    try {
      const response = await fetch("/api/admin/courses/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "content",
          field,
          topic: formData.title || course.title,
          currentValue: formData[field],
        }),
      });

      const data = await response.json();
      if (data.success && data.data.content) {
        handleFieldChange(field, data.data.content);
      }
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setAiGenerating(null);
    }
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify({
    title: course.title || "",
    slug: course.slug || "",
    short_description: course.short_description || "",
    description: course.description || "",
    price: course.price?.toString() || "0",
    image_url: course.image_url || "",
  });

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Course Title *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAIGenerate("title")}
                  disabled={aiGenerating === "title"}
                >
                  {aiGenerating === "title" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleFieldChange("slug", e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                URL: /courses/{formData.slug || "your-slug"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="short_description">Short Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAIGenerate("short_description")}
                  disabled={aiGenerating === "short_description"}
                >
                  {aiGenerating === "short_description" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => handleFieldChange("short_description", e.target.value)}
                placeholder="Brief one-liner for marketing"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Full Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAIGenerate("description")}
                  disabled={aiGenerating === "description"}
                >
                  {aiGenerating === "description" ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                </Button>
              </div>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                className="w-full min-h-[150px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Detailed course description..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleFieldChange("price", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => handleFieldChange("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            {hasChanges && (
              <Button onClick={handleSave} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Course Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="published" className="text-sm font-medium">
                  Published
                </Label>
                <p className="text-xs text-muted-foreground">
                  {course.published
                    ? "Course is visible to students"
                    : "Course is hidden (draft mode)"}
                </p>
              </div>
              <Switch
                id="published"
                checked={course.published || false}
                onCheckedChange={handleTogglePublished}
                disabled={loading}
              />
            </div>
            <div className="pt-2 border-t">
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium">Price: </span>
                  <span className="text-sm text-muted-foreground">${course.price}</span>
                </div>
                {course.stripe_product_id && (
                  <div>
                    <span className="text-sm font-medium">Stripe Product: </span>
                    <span className="text-sm text-muted-foreground text-xs font-mono break-all">
                      {course.stripe_product_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={publishConfirm.open}
        onOpenChange={(open) => setPublishConfirm({ ...publishConfirm, open })}
        title="Publish Course"
        description={publishConfirm.warningMessage + "\n\nDo you want to publish anyway? (You can configure Stripe and link products later in Settings)"}
        confirmText="Publish Anyway"
        cancelText="Cancel"
        onConfirm={() => {
          onUpdate({ published: !course.published });
          setPublishConfirm({ open: false, warningMessage: "" });
        }}
      />
    </div>
  );
}


