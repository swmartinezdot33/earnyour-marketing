"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { BulkActions } from "./BulkActions";
import { showToast } from "@/components/ui/toast";
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
import {
  GripVertical,
  Plus,
  Loader2,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Edit2,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Download,
  Play,
} from "lucide-react";
import Link from "next/link";
import { VisualLessonEditor } from "./VisualLessonEditor";

interface VisualModuleEditorProps {
  courseId: string;
  courseTitle: string;
  modules: any[];
  onUpdate: () => void;
  previewMode?: boolean;
}

function SortableModuleItem({
  module,
  courseId,
  courseTitle,
  onDelete,
  onUpdate,
  previewMode,
  selected,
  onSelect,
  bulkMode,
}: {
  module: any;
  courseId: string;
  courseTitle: string;
  onDelete: (id: string) => void;
  onUpdate: () => void;
  previewMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  bulkMode?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(module.title);
  const [description, setDescription] = useState(module.description || "");

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
    if (lessons.length > 0) return;
    
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

  const handleSaveTitle = async () => {
    if (title !== module.title) {
      try {
        await fetch(`/api/admin/modules/${module.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
        onUpdate();
      } catch (error) {
        console.error("Error updating module title:", error);
      }
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    try {
      await fetch(`/api/admin/modules/${module.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description || null }),
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating module description:", error);
    }
    setEditingDescription(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg" : ""} transition-all`}
    >
      <CardContent className="p-0">
        {/* Module Header */}
        <div className="flex items-start gap-4 p-6 border-b">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
            <GripVertical className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="h-8 w-8 p-0"
          >
            {expanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {bulkMode && onSelect && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={(checked) => onSelect(module.id, checked as boolean)}
                />
              )}
              {editingTitle ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") {
                      setTitle(module.title);
                      setEditingTitle(false);
                    }
                  }}
                  className="font-semibold text-lg"
                  autoFocus
                />
              ) : (
                <h3
                  className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors"
                  onClick={() => !previewMode && setEditingTitle(true)}
                >
                  {module.title}
                  {!previewMode && (
                    <Edit2 className="h-3 w-3 inline-block ml-2 opacity-0 group-hover:opacity-100" />
                  )}
                </h3>
              )}
            </div>

            {editingDescription ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSaveDescription}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setDescription(module.description || "");
                    setEditingDescription(false);
                  }
                }}
                className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="Module description (optional)"
                autoFocus
              />
            ) : (
              <p
                className={`text-sm text-muted-foreground ${
                  !previewMode ? "cursor-pointer hover:text-foreground" : ""
                } transition-colors`}
                onClick={() => !previewMode && setEditingDescription(true)}
              >
                {module.description || "Click to add description"}
              </p>
            )}
          </div>

          {!previewMode && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(module.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Lessons */}
        {expanded && (
          <div className="p-6 bg-muted/20">
            {loadingLessons ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
            <VisualLessonEditor
              moduleId={module.id}
              moduleTitle={module.title}
              courseTitle={courseTitle}
              lessons={lessons}
              onUpdate={fetchLessons}
              previewMode={previewMode}
              courseId={courseId}
            />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function VisualModuleEditor({
  courseId,
  courseTitle,
  modules,
  onUpdate,
  previewMode = false,
}: VisualModuleEditorProps) {
  // courseId is already defined in props, no need to duplicate
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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
        alert(data.error || "Failed to create module");
      }
    } catch (error) {
      console.error("Error creating module:", error);
      alert("Failed to create module. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module? All lessons will be deleted too.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/modules/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Module deleted successfully", "success");
        onUpdate();
      } else {
        const errorData = await response.json();
        showToast(errorData.error || "Failed to delete module", "error");
      }
    } catch (error) {
      console.error("Error deleting module:", error);
      showToast("Failed to delete module. Please try again.", "error");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} modules? All lessons will be deleted too.`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = ids.map((id) =>
        fetch(`/api/admin/modules/${id}`, { method: "DELETE" })
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.ok).length;

      if (failed === 0) {
        showToast(`Successfully deleted ${ids.length} modules`, "success");
        setSelectedModules(new Set());
        setBulkMode(false);
        onUpdate();
      } else {
        showToast(`Failed to delete ${failed} modules`, "error");
      }
    } catch (error) {
      console.error("Error deleting modules:", error);
      showToast("Failed to delete modules. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCopy = async (ids: string[]) => {
    setLoading(true);
    try {
      // Fetch modules with their lessons
      const modulePromises = ids.map(async (id) => {
        const module = modules.find((m) => m.id === id);
        if (!module) return null;

        const lessonsResponse = await fetch(`/api/admin/modules/${id}/lessons`);
        const lessonsData = await lessonsResponse.json();
        return {
          ...module,
          lessons: lessonsData.success ? lessonsData.lessons : [],
        };
      });

      const modulesWithLessons = (await Promise.all(modulePromises)).filter(Boolean);

      // Create copies
      for (const module of modulesWithLessons) {
        // Create new module
        const moduleResponse = await fetch(`/api/admin/courses/${courseId}/modules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${module.title} (Copy)`,
            description: module.description,
          }),
        });

        const moduleData = await moduleResponse.json();
        if (moduleData.success) {
          // Copy lessons
          for (const lesson of module.lessons || []) {
            await fetch(`/api/admin/modules/${moduleData.module.id}/lessons`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: lesson.title,
                description: lesson.description,
                content_type: lesson.content_type,
              }),
            });
          }
        }
      }

      showToast(`Successfully copied ${ids.length} modules`, "success");
      setSelectedModules(new Set());
      setBulkMode(false);
      onUpdate();
    } catch (error) {
      console.error("Error copying modules:", error);
      showToast("Failed to copy modules. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModule = (id: string, checked: boolean) => {
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over?.id);
      const newModules = arrayMove(modules, oldIndex, newIndex);

      onUpdate();

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
        onUpdate();
      }
    }
  };

  const handleAIGenerateModule = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a module title first");
      return;
    }

    if (!courseId) {
      alert("Course ID is missing. Please refresh the page.");
      return;
    }

    setAiGenerating(true);
    try {
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

      for (const lesson of generatedLessons) {
        await fetch(`/api/admin/modules/${moduleData.module.id}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(lesson),
        });
      }

      setFormData({ title: "", description: "" });
      setShowForm(false);
      onUpdate();
    } catch (error) {
      console.error("Error generating module:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate module";
      alert(`${errorMessage}. ${errorMessage.includes("OPENAI_API_KEY") ? "Please check your OpenAI API key configuration." : ""}`);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Module Button */}
      {!showForm && !previewMode && (
        <Button onClick={() => setShowForm(true)} className="w-full" size="lg">
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      )}

      {/* Add Module Form */}
      {showForm && !previewMode && (
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="module-title">Module Title *</Label>
                <Input
                  id="module-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g., Introduction to Marketing"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-description">Description</Label>
                <textarea
                  id="module-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  placeholder="What will students learn in this module?"
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
                      Generate with AI
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

      {bulkMode && !previewMode && (
        <BulkActions
          selectedItems={Array.from(selectedModules)}
          onDelete={handleBulkDelete}
          onCopy={handleBulkCopy}
          type="modules"
        />
      )}

      {/* Modules List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {modules.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No modules yet</h3>
                  <p className="text-muted-foreground mb-6">
                    {previewMode
                      ? "This course doesn't have any modules yet."
                      : "Create your first module to get started building your course."}
                  </p>
                  {!previewMode && (
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Module
                    </Button>
                  )}
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
                  previewMode={previewMode}
                  selected={selectedModules.has(module.id)}
                  onSelect={handleSelectModule}
                  bulkMode={bulkMode}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

