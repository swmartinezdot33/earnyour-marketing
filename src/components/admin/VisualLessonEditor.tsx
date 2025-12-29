"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
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
  Video,
  FileText,
  HelpCircle,
  Download,
  Edit2,
  Trash2,
  Play,
  ExternalLink,
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { EnhancedLessonEditor } from "./EnhancedLessonEditor";
import { EnhancedLessonEditor } from "./EnhancedLessonEditor";

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video, color: "text-red-500" },
  { value: "text", label: "Text", icon: FileText, color: "text-blue-500" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, color: "text-purple-500" },
  { value: "download", label: "Download", icon: Download, color: "text-green-500" },
  { value: "interactive_video", label: "Interactive Video", icon: PlayCircle, color: "text-orange-500" },
  { value: "live_session", label: "Live Session", icon: Calendar, color: "text-pink-500" },
];

interface VisualLessonEditorProps {
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  lessons: any[];
  onUpdate: () => void;
  previewMode?: boolean;
  courseId?: string;
}

function SortableLessonItem({
  lesson,
  onDelete,
  courseId,
  previewMode,
  selected,
  onSelect,
  bulkMode,
}: {
  lesson: any;
  onDelete: (id: string) => void;
  courseId?: string;
  previewMode?: boolean;
  selected?: boolean;
  onSelect?: (id: string, checked: boolean) => void;
  bulkMode?: boolean;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description || "");

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const contentType = CONTENT_TYPES.find((ct) => ct.value === lesson.content_type);
  const Icon = contentType?.icon || FileText;
  const iconColor = contentType?.color || "text-muted-foreground";

  const handleSaveTitle = async () => {
    if (title !== lesson.title && title.trim()) {
      try {
        await fetch(`/api/admin/lessons/${lesson.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        });
      } catch (error) {
        console.error("Error updating lesson title:", error);
      }
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    try {
      await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description || null }),
      });
    } catch (error) {
      console.error("Error updating lesson description:", error);
    }
    setEditingDescription(false);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? "shadow-lg ring-2 ring-primary" : ""} transition-all hover:shadow-md`}
    >
      <div className="p-4 flex items-start gap-4">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing mt-1">
          <GripVertical className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
        </div>

        <div className={`${iconColor} mt-1`}>
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex-1 space-y-2 min-w-0">
          {bulkMode && onSelect && (
            <Checkbox
              checked={selected}
              onCheckedChange={(checked) => onSelect(lesson.id, checked as boolean)}
              className="mr-2"
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
                  setTitle(lesson.title);
                  setEditingTitle(false);
                }
              }}
              className="font-medium"
              autoFocus
            />
          ) : (
            <div className="flex items-start justify-between gap-2">
              <h4
                className={`font-medium cursor-pointer hover:text-primary transition-colors ${
                  !previewMode ? "" : ""
                }`}
                onClick={() => !previewMode && setEditingTitle(true)}
              >
                {lesson.title}
              </h4>
              {courseId && !previewMode && (
                <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-8">
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {editingDescription ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleSaveDescription}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDescription(lesson.description || "");
                  setEditingDescription(false);
                }
              }}
              className="w-full min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
              placeholder="Lesson description (optional)"
              autoFocus
            />
          ) : (
            <p
              className={`text-sm text-muted-foreground ${
                !previewMode ? "cursor-pointer hover:text-foreground" : ""
              } transition-colors`}
              onClick={() => !previewMode && setEditingDescription(true)}
            >
              {lesson.description || "Click to add description"}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="capitalize">{lesson.content_type.replace("_", " ")}</span>
            {lesson.duration_minutes && (
              <>
                <span>•</span>
                <span>{lesson.duration_minutes} min</span>
              </>
            )}
          </div>
        </div>

        {!previewMode && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(lesson)}
                title="Edit lesson"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(lesson.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export function VisualLessonEditor({
  moduleId,
  moduleTitle,
  courseTitle,
  lessons,
  onUpdate,
  previewMode = false,
  courseId,
}: VisualLessonEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "video" as "video" | "text" | "quiz" | "download" | "interactive_video" | "live_session",
  });
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonContent, setLessonContent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setFormData({ title: "", description: "", content_type: "video" });
        setShowForm(false);
        onUpdate();
      } else {
        alert(data.error || "Failed to create lesson");
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
      alert("Failed to create lesson. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast("Lesson deleted successfully", "success");
        onUpdate();
      } else {
        showToast("Failed to delete lesson", "error");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      showToast("Failed to delete lesson. Please try again.", "error");
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} lessons?`)) {
      return;
    }

    setLoading(true);
    try {
      const deletePromises = ids.map((id) =>
        fetch(`/api/admin/lessons/${id}`, { method: "DELETE" })
      );
      const results = await Promise.all(deletePromises);
      const failed = results.filter((r) => !r.ok).length;

      if (failed === 0) {
        showToast(`Successfully deleted ${ids.length} lessons`, "success");
        setSelectedLessons(new Set());
        setBulkMode(false);
        onUpdate();
      } else {
        showToast(`Failed to delete ${failed} lessons`, "error");
      }
    } catch (error) {
      console.error("Error deleting lessons:", error);
      showToast("Failed to delete lessons. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCopy = async (ids: string[]) => {
    setLoading(true);
    try {
      for (const id of ids) {
        const lesson = lessons.find((l) => l.id === id);
        if (!lesson) continue;

        await fetch(`/api/admin/modules/${moduleId}/lessons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `${lesson.title} (Copy)`,
            description: lesson.description,
            content_type: lesson.content_type,
          }),
        });
      }

      showToast(`Successfully copied ${ids.length} lessons`, "success");
      setSelectedLessons(new Set());
      setBulkMode(false);
      onUpdate();
    } catch (error) {
      console.error("Error copying lessons:", error);
      showToast("Failed to copy lessons. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (id: string, checked: boolean) => {
    setSelectedLessons((prev) => {
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
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over?.id);
      const newLessons = arrayMove(lessons, oldIndex, newIndex);

      onUpdate();

      try {
        await fetch(`/api/admin/lessons/reorder`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lessons: newLessons.map((l, i) => ({ id: l.id, order: i })),
          }),
        });
      } catch (error) {
        console.error("Error reordering lessons:", error);
        onUpdate();
      }
    }
  };

  const handleAIGenerateDescription = async () => {
    if (!formData.title.trim()) {
      alert("Please enter a lesson title first");
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch("/api/admin/courses/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "lesson-description",
          lessonTitle: formData.title,
          moduleTitle,
          courseTopic: courseTitle,
        }),
      });

      const data = await response.json();
      if (data.success && data.data.description) {
        setFormData({ ...formData, description: data.data.description });
      }
    } catch (error) {
      console.error("Error generating description:", error);
    } finally {
      setAiGenerating(false);
    }
  };

  const handleEditLesson = async (lesson: any) => {
    setEditingLesson(lesson);
    // Fetch lesson content
    try {
      const response = await fetch(`/api/admin/lessons/${lesson.id}/content`);
      const data = await response.json();
      if (data.success) {
        setLessonContent(data.content);
      }
    } catch (error) {
      console.error("Error fetching lesson content:", error);
      setLessonContent(null);
    }
  };

  const handleCloseEditor = () => {
    setEditingLesson(null);
    setLessonContent(null);
    onUpdate();
  };

  return (
    <div className="space-y-4">
      {!previewMode && (
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Lessons ({lessons.length})
          </h4>
          <div className="flex gap-2">
            {!showForm && (
              <>
                <Button size="sm" onClick={() => setShowForm(true)} variant="outline">
                  <Plus className="mr-2 h-3 w-3" />
                  Add Lesson
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setBulkMode(!bulkMode);
                    if (bulkMode) {
                      setSelectedLessons(new Set());
                    }
                  }}
                  variant={bulkMode ? "default" : "outline"}
                >
                  {bulkMode ? "Cancel" : "Select"}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {showForm && !previewMode && (
        <Card>
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lesson-title">Lesson Title *</Label>
              <Input
                id="lesson-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="e.g., Introduction to Marketing Fundamentals"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lesson-description">Description</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAIGenerateDescription}
                  disabled={aiGenerating || !formData.title.trim()}
                >
                  {aiGenerating ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
              <textarea
                id="lesson-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                placeholder="What will students learn in this lesson?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lesson-content-type">Content Type *</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, content_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className={`h-4 w-4 ${type.color}`} />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleCreateLesson} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Lesson"
                )}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {bulkMode && !previewMode && (
        <BulkActions
          selectedItems={Array.from(selectedLessons)}
          onDelete={handleBulkDelete}
          onCopy={handleBulkCopy}
          type="lessons"
        />
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {previewMode
                  ? "No lessons in this module yet."
                  : "No lessons yet. Add your first lesson to get started."}
              </div>
            ) : (
              lessons.map((lesson) => (
                <div key={lesson.id} className="group">
                  <SortableLessonItem
                    lesson={lesson}
                    onDelete={handleDeleteLesson}
                    previewMode={previewMode}
                    courseId={courseId}
                    selected={selectedLessons.has(lesson.id)}
                    onSelect={handleSelectLesson}
                    bulkMode={bulkMode}
                    onEdit={handleEditLesson}
                  />
                </div>
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {editingLesson && courseId && (
        <EnhancedLessonEditor
          lesson={editingLesson}
          content={lessonContent}
          courseId={courseId}
          open={!!editingLesson}
          onClose={handleCloseEditor}
          onUpdate={handleCloseEditor}
        />
      )}
    </div>
  );
}

