"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, GripVertical, Video, FileText, HelpCircle, Download } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video },
  { value: "text", label: "Text", icon: FileText },
  { value: "quiz", label: "Quiz", icon: HelpCircle },
  { value: "download", label: "Download", icon: Download },
];

function SortableLessonItem({ lesson, onDelete }: { lesson: any; onDelete: (id: string) => void }) {
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
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div className="flex-1">
        <h3 className="font-semibold">{lesson.title}</h3>
        {lesson.description && (
          <p className="text-sm text-muted-foreground">{lesson.description}</p>
        )}
        <span className="text-xs text-muted-foreground capitalize">{lesson.content_type}</span>
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/lessons/${lesson.id}/edit`}>
          <Button variant="outline" size="sm">Edit</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => onDelete(lesson.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function LessonsPage({ params }: { params: Promise<{ id: string; moduleId: string }> }) {
  const router = useRouter();
  const [moduleId, setModuleId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content_type: "video",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    params.then((p) => {
      setModuleId(p.moduleId);
      setCourseId(p.id);
      fetchLessons(p.moduleId);
    });
  }, [params]);

  const fetchLessons = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/modules/${id}/lessons`);
      const data = await response.json();
      if (data.success) {
        setLessons(data.lessons);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      setLoading(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/modules/${moduleId}/lessons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setLessons([...lessons, data.lesson]);
        setFormData({ title: "", description: "", content_type: "video" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating lesson:", error);
    }
  };

  const handleDeleteLesson = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lesson?")) return;

    try {
      const response = await fetch(`/api/admin/lessons/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLessons(lessons.filter((l) => l.id !== id));
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = lessons.findIndex((l) => l.id === active.id);
      const newIndex = lessons.findIndex((l) => l.id === over.id);
      const newLessons = arrayMove(lessons, oldIndex, newIndex);

      setLessons(newLessons);

      await fetch(`/api/admin/lessons/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessons: newLessons.map((l, i) => ({ id: l.id, order: i })),
        }),
      });
    }
  };

  if (loading) {
    return (
      <Section className="pt-24 pb-16">
        <Container>Loading...</Container>
      </Section>
    );
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <Link href={`/admin/courses/${courseId}/modules`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Modules
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Manage Lessons
          </h1>
        </div>

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus className="mr-2 h-4 w-4" />
            Add Lesson
          </Button>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Lesson</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <Label htmlFor="title">Lesson Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="content_type">Content Type *</Label>
                  <select
                    id="content_type"
                    value={formData.content_type}
                    onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                    required
                  >
                    {CONTENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full min-h-[100px] rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Create Lesson</Button>
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
          <SortableContext items={lessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {lessons.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground">No lessons yet. Create your first lesson to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                lessons.map((lesson) => (
                  <SortableLessonItem key={lesson.id} lesson={lesson} onDelete={handleDeleteLesson} />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>
      </Container>
    </Section>
  );
}







