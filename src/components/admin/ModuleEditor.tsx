"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Loader2, Sparkles, ChevronDown, ChevronRight } from "lucide-react";
import { LessonEditor } from "./LessonEditor";
import { showToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ModuleEditorProps {
  courseId: string;
  courseTitle: string;
  modules: any[];
  onUpdate: () => void;
}

function SortableModuleItem({
  module,
  courseId,
  courseTitle,
  onDelete,
  onUpdate,
}: {
  module: any;
  courseId: string;
  courseTitle: string;
  onDelete: (id: string) => void;
  onUpdate: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const fetchLessons = async () => {
    if (lessons.length > 0) return; // Already loaded
    
    setLoadingLessons(true);
    try {
      const response = await fetch(`/api/admin/modules/${module.id}/lessons`);
      const data = await response.json();
      if (data.success) {
        setLessons(data.lessons);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleToggleExpand = () => {
    if (!expanded) {
      fetchLessons();
    }
    setExpanded(!expanded);
  };

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg bg-white">
      <div className="flex items-center gap-4 p-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleExpand}
          className="h-6 w-6 p-0"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        <div className="flex-1">
          <h3 className="font-semibold">{module.title}</h3>
          {module.description && (
            <p className="text-sm text-muted-foreground">{module.description}</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => onDelete(module.id)}>
          Delete
        </Button>
      </div>

      {expanded && (
        <div className="border-t p-4 bg-muted/30">
          {loadingLessons ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : (
            <LessonEditor
              moduleId={module.id}
              moduleTitle={module.title}
              courseTitle={courseTitle}
              lessons={lessons}
              onUpdate={fetchLessons}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function ModuleEditor({ courseId, courseTitle, modules, onUpdate }: ModuleEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; moduleId: string | null }>({ open: false, moduleId: null });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      alert("Course ID is missing. Please refresh the page.");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ title: "", description: "" });
        setShowForm(false);
        onUpdate();
      } else {
        showToast(data.error || "Failed to create module", "error");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      showToast("Failed to create module. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    setDeleteConfirm({ open: true, moduleId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.moduleId) return;

    try {
      const response = await fetch(`/api/admin/modules/${deleteConfirm.moduleId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Module deleted successfully", "success");
        onUpdate();
      } else {
        showToast("Failed to delete module", "error");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      showToast("Failed to delete module", "error");
    } finally {
      setDeleteConfirm({ open: false, moduleId: null });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over?.id);
      const newModules = arrayMove(modules, oldIndex, newIndex);

      // Optimistically update UI
      onUpdate();

      // Update order in database
      try {
        await fetch(`/api/admin/modules/reorder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modules: newModules.map((m, i) => ({ id: m.id, order: i })),
          }),
        });
      } catch (error) {
        console.error("Error reordering modules:", error);
        onUpdate(); // Refresh to get correct order
      }
    }
  };

  const handleAIGenerateModule = async () => {
    if (!formData.title.trim()) {
      showToast("Please enter a module title first", "warning");
      return;
    }

    if (!courseId) {
      alert("Course ID is missing. Please refresh the page.");
      return;
    }

    setAiGenerating(true);
    try {
      // First, generate the module outline with lessons
      const generateResponse = await fetch("/api/admin/courses/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "module-outline",
          moduleTitle: formData.title,
          courseTopic: courseTitle,
          moduleDescription: formData.description || undefined,
        }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${generateResponse.status}`);
      }

      const generateData = await generateResponse.json();
      if (!generateData.success || !generateData.data?.lessons) {
        throw new Error(generateData.error || "Failed to generate module outline");
      }

      const generatedLessons = generateData.data.lessons;

      // Create the module
      const moduleResponse = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
        }),
      });

      if (!moduleResponse.ok) {
        throw new Error("Failed to create module");
      }

      const moduleData = await moduleResponse.json();
      if (!moduleData.success) {
        throw new Error(moduleData.error || "Failed to create module");
      }

      // Create all generated lessons
      for (const lesson of generatedLessons) {
        const lessonResponse = await fetch(`/api/admin/modules/${moduleData.module.id}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lesson),
        });
        
        if (!lessonResponse.ok) {
          console.warn("Failed to create lesson:", lesson.title);
        }
      }

      setFormData({ title: "", description: "" });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error("Error generating module:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate module";
      showToast(`${errorMessage}. ${errorMessage.includes("OPENAI_API_KEY") ? "Please check your OpenAI API key configuration." : ""}`, "error");
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Create New Module</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Module Title *</Label>
                <Input
                  id="module-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <textarea
                  id="module-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Module"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAIGenerateModule}
                  disabled={aiGenerating || !formData.title.trim()}
                >
                  {aiGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate with AI (including lessons)
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    No modules yet. Create your first module to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              modules.map((module) => (
                <SortableModuleItem
                  key={module.id}
                  module={module}
                  courseId={courseId}
                  courseTitle={courseTitle}
                  onDelete={handleDeleteModule}
                  onUpdate={onUpdate}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Module"
        description="Are you sure you want to delete this module? All lessons will be deleted too. This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
}

