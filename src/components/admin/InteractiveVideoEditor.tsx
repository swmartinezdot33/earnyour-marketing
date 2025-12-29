"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Clock, BookOpen, Link as LinkIcon, FileText, Loader2, Save } from "lucide-react";
import { showToast } from "@/components/ui/toast";

export interface VideoInteraction {
  id: string;
  timestamp: number; // in seconds
  type: "bookmark" | "question" | "resource" | "chapter" | "note";
  title: string;
  content?: string;
  url?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
}

interface InteractiveVideoEditorProps {
  lessonId: string;
  videoUrl: string;
  videoProvider: "youtube" | "vimeo" | "mux" | "custom" | null;
  initialInteractions?: VideoInteraction[];
  onSave: (interactions: VideoInteraction[]) => Promise<void>;
}

export function InteractiveVideoEditor({
  lessonId,
  videoUrl,
  videoProvider,
  initialInteractions = [],
  onSave,
}: InteractiveVideoEditorProps) {
  const [interactions, setInteractions] = useState<VideoInteraction[]>(initialInteractions);
  const [editingInteraction, setEditingInteraction] = useState<VideoInteraction | null>(null);
  const [saving, setSaving] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    setInteractions(initialInteractions);
  }, [initialInteractions]);

  const handleAddInteraction = (type: VideoInteraction["type"]) => {
    const newInteraction: VideoInteraction = {
      id: `i-${Date.now()}`,
      timestamp: 0,
      type,
      title: "",
      content: "",
      url: "",
      question: "",
      options: type === "question" ? ["", ""] : undefined,
      correctAnswer: undefined,
    };
    setEditingInteraction(newInteraction);
  };

  const handleSaveInteraction = (interaction: VideoInteraction) => {
    if (!interaction.title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    if (editingInteraction?.id && interactions.find((i) => i.id === editingInteraction.id)) {
      // Update existing
      setInteractions(interactions.map((i) => (i.id === interaction.id ? interaction : i)));
    } else {
      // Add new
      setInteractions([...interactions, interaction].sort((a, b) => a.timestamp - b.timestamp));
    }
    setEditingInteraction(null);
  };

  const handleDeleteInteraction = (id: string) => {
    setInteractions(interactions.filter((i) => i.id !== id));
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTimestamp = (timeString: string) => {
    const parts = timeString.split(":");
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    }
    return 0;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(interactions);
      showToast("Interactive video saved successfully!", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to save interactive video", "error");
    } finally {
      setSaving(false);
    }
  };

  const getInteractionIcon = (type: VideoInteraction["type"]) => {
    switch (type) {
      case "bookmark":
        return BookOpen;
      case "question":
        return FileText;
      case "resource":
        return LinkIcon;
      case "chapter":
        return Clock;
      case "note":
        return FileText;
      default:
        return FileText;
    }
  };

  const getInteractionLabel = (type: VideoInteraction["type"]) => {
    switch (type) {
      case "bookmark":
        return "Bookmark";
      case "question":
        return "Question";
      case "resource":
        return "Resource";
      case "chapter":
        return "Chapter";
      case "note":
        return "Note";
      default:
        return "Interaction";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Interactive Video Elements</h3>
          <p className="text-sm text-muted-foreground">
            Add bookmarks, questions, resources, and chapters to your video
          </p>
        </div>
        <div className="flex gap-2">
          <Select onValueChange={(value) => handleAddInteraction(value as VideoInteraction["type"])}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Add Element" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bookmark">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Bookmark
                </div>
              </SelectItem>
              <SelectItem value="question">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Question
                </div>
              </SelectItem>
              <SelectItem value="resource">
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Resource
                </div>
              </SelectItem>
              <SelectItem value="chapter">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Chapter
                </div>
              </SelectItem>
              <SelectItem value="note">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Note
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {videoUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Video Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {videoProvider === "youtube" ? (
                <iframe
                  src={(() => {
                    const url = videoUrl;
                    if (url.includes("youtube.com/watch?v=")) {
                      return url.replace("watch?v=", "embed/");
                    }
                    if (url.includes("youtu.be/")) {
                      return `https://www.youtube.com/embed/${url.split("youtu.be/")[1].split("?")[0]}`;
                    }
                    if (url.includes("youtube.com/embed/")) {
                      return url;
                    }
                    return url;
                  })()}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : videoProvider === "vimeo" ? (
                <iframe
                  src={`https://player.vimeo.com/video/${videoUrl.split("/").pop()?.split("?")[0]}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : (
                <video src={videoUrl} controls className="w-full h-full rounded-lg" />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {interactions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No interactive elements yet. Add your first element to get started.
            </CardContent>
          </Card>
        ) : (
          interactions.map((interaction) => {
            const Icon = getInteractionIcon(interaction.type);
            return (
              <Card key={interaction.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Icon className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            {getInteractionLabel(interaction.type)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            • {formatTimestamp(interaction.timestamp)}
                          </span>
                        </div>
                        <p className="font-medium">{interaction.title || "Untitled"}</p>
                        {interaction.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {interaction.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingInteraction(interaction)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInteraction(interaction.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {editingInteraction && (
        <InteractionEditor
          interaction={editingInteraction}
          onSave={handleSaveInteraction}
          onCancel={() => setEditingInteraction(null)}
          formatTimestamp={formatTimestamp}
          parseTimestamp={parseTimestamp}
        />
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Interactive Video
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function InteractionEditor({
  interaction,
  onSave,
  onCancel,
  formatTimestamp,
  parseTimestamp,
}: {
  interaction: VideoInteraction;
  onSave: (interaction: VideoInteraction) => void;
  onCancel: () => void;
  formatTimestamp: (seconds: number) => string;
  parseTimestamp: (timeString: string) => number;
}) {
  const [editedInteraction, setEditedInteraction] = useState<VideoInteraction>(interaction);

  useEffect(() => {
    setEditedInteraction(interaction);
  }, [interaction]);

  const handleSave = () => {
    if (!editedInteraction.title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    onSave(editedInteraction);
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...(editedInteraction.options || [])];
    newOptions[index] = value;
    setEditedInteraction({ ...editedInteraction, options: newOptions });
  };

  const addOption = () => {
    setEditedInteraction({
      ...editedInteraction,
      options: [...(editedInteraction.options || []), ""],
    });
  };

  const removeOption = (index: number) => {
    const newOptions = editedInteraction.options?.filter((_, i) => i !== index) || [];
    setEditedInteraction({ ...editedInteraction, options: newOptions });
  };

  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle>Edit {getInteractionLabel(editedInteraction.type)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="timestamp">Timestamp (MM:SS)</Label>
          <Input
            id="timestamp"
            value={formatTimestamp(editedInteraction.timestamp)}
            onChange={(e) => {
              const seconds = parseTimestamp(e.target.value);
              setEditedInteraction({ ...editedInteraction, timestamp: seconds });
            }}
            placeholder="0:00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={editedInteraction.title}
            onChange={(e) =>
              setEditedInteraction({ ...editedInteraction, title: e.target.value })
            }
            placeholder="Enter title"
          />
        </div>

        {editedInteraction.type === "question" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Textarea
                id="question"
                value={editedInteraction.question || ""}
                onChange={(e) =>
                  setEditedInteraction({ ...editedInteraction, question: e.target.value })
                }
                placeholder="Enter your question"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Answer Options</Label>
              {editedInteraction.options?.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <Button
                    type="button"
                    variant={editedInteraction.correctAnswer === index ? "default" : "outline"}
                    size="sm"
                    onClick={() =>
                      setEditedInteraction({
                        ...editedInteraction,
                        correctAnswer: editedInteraction.correctAnswer === index ? undefined : index,
                      })
                    }
                  >
                    Correct
                  </Button>
                  {editedInteraction.options && editedInteraction.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
          </>
        )}

        {(editedInteraction.type === "resource" || editedInteraction.type === "note") && (
          <div className="space-y-2">
            <Label htmlFor="url">URL (for resource)</Label>
            <Input
              id="url"
              value={editedInteraction.url || ""}
              onChange={(e) =>
                setEditedInteraction({ ...editedInteraction, url: e.target.value })
              }
              placeholder="https://..."
              type="url"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="content">Content/Description</Label>
          <Textarea
            id="content"
            value={editedInteraction.content || ""}
            onChange={(e) =>
              setEditedInteraction({ ...editedInteraction, content: e.target.value })
            }
            placeholder="Additional content or description"
            rows={3}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function getInteractionLabel(type: VideoInteraction["type"]): string {
  switch (type) {
    case "bookmark":
      return "Bookmark";
    case "question":
      return "Question";
    case "resource":
      return "Resource";
    case "chapter":
      return "Chapter";
    case "note":
      return "Note";
    default:
      return "Interaction";
  }
}

