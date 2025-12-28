"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { GripVertical, Plus, Loader2, Sparkles, Video, FileText, HelpCircle, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "text", label: "Text", icon: FileText },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "download", label: "Download", icon: Download },
];

interface LessonEditorProps {
  moduleId: string;
  moduleTitle: string;
  courseTitle: string;
  lessons: any[];
  onUpdate: () => void;
}

function SortableLessonItem({
  lesson,
  onDelete,
}: {
  lesson: any;
  onDelete: (id: string) => void;
}) {
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

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-3 border rounded-lg bg-white">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1">
        <h4 className="font-medium text-sm">{lesson.title}</h4>
        {lesson.description && (
          <p className="text-xs text-muted-foreground">{lesson.description}</p>
        )}
      </div>
      <Button variant="outline" size="sm" onClick={() => onDelete(lesson.id)}>
        Delete
      </Button>
    </div>
  );
}

export function LessonEditor({
  moduleId,
  moduleTitle,
  courseTitle,
  lessons,
  onUpdate,
}: LessonEditorProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "video" as "video" | "text" | "quiz" | "download",
  });
  const [loading, setLoading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

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
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
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
        onUpdate();
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold">Lessons</h4>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-3 w-3" />
            Add Lesson
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border rounded-lg p-4 bg-background space-y-4">
          <div className="space-y-2">
            <Label htmlFor="lesson-title">Lesson Title *</Label>
            <Input
              id="lesson-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
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
                      <type.icon className="h-4 w-4" />
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
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No lessons yet. Add your first lesson.
              </p>
            ) : (
              lessons.map((lesson) => (
                <SortableLessonItem key={lesson.id} lesson={lesson} onDelete={handleDeleteLesson} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}


