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
import { ArrowLeft, Plus, GripVertical } from "lucide-react";
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
import { showToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

function SortableModuleItem({ module, onDelete }: { module: any; onDelete: (id: string) => void }) {
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

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 border rounded-lg bg-white">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold">{module.title}</h3>
        {module.description && (
          <p className="text-sm text-muted-foreground">{module.description}</p>
        )}
      </div>
      <div className="flex gap-2">
        <Link href={`/admin/courses/${module.course_id}/modules/${module.id}/lessons`}>
          <Button variant="outline" size="sm">Manage Lessons</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={() => onDelete(module.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export default function ModulesPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>("");
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; moduleId: string | null }>({ open: false, moduleId: null });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "" });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    params.then((p) => {
      setCourseId(p.id);
      fetchModules(p.id);
    });
  }, [params]);

  const fetchModules = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/courses/${id}/modules`);
      const data = await response.json();
      if (data.success) {
        setModules(data.modules);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching modules:", error);
      setLoading(false);
    }
  };

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setModules([...modules, data.module]);
        setFormData({ title: "", description: "" });
        setShowForm(false);
      }
    } catch (error) {
      console.error("Error creating module:", error);
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
        setModules(modules.filter((m) => m.id !== deleteConfirm.moduleId));
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

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const newModules = arrayMove(modules, oldIndex, newIndex);

      setModules(newModules);

      // Update order in database
      await fetch(`/api/admin/modules/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modules: newModules.map((m, i) => ({ id: m.id, order: i })),
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
          <Link href={`/admin/courses/${courseId}/edit`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Manage Modules
          </h1>
        </div>

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="mb-6">
            <Plus className="mr-2 h-4 w-4" />
            Add Module
          </Button>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Module</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <Label htmlFor="title">Module Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
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
                  <Button type="submit">Create Module</Button>
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
                    <p className="text-muted-foreground">No modules yet. Create your first module to get started.</p>
                  </CardContent>
                </Card>
              ) : (
                modules.map((module) => (
                  <SortableModuleItem key={module.id} module={module} onDelete={handleDeleteModule} />
                ))
              )}
            </div>
          </SortableContext>
        </DndContext>

        <ConfirmDialog
          open={deleteConfirm.open}
          onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
          title="Delete Module"
          description="Are you sure you want to delete this module? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={confirmDelete}
        />
      </Container>
    </Section>
  );
}







