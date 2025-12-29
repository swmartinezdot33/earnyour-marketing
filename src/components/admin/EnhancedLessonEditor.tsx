"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, X, Video, FileText, HelpCircle, Download, Calendar, PlayCircle } from "lucide-react";
import { QuizBuilder } from "./QuizBuilder";
import { InteractiveVideoEditor } from "./InteractiveVideoEditor";
import { showToast } from "@/components/ui/toast";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const CONTENT_TYPES = [
  { value: "video", label: "Video", icon: Video, color: "text-red-500" },
  { value: "text", label: "Text", icon: FileText, color: "text-blue-500" },
  { value: "quiz", label: "Quiz", icon: HelpCircle, color: "text-purple-500" },
  { value: "download", label: "Download", icon: Download, color: "text-green-500" },
  { value: "interactive_video", label: "Interactive Video", icon: PlayCircle, color: "text-orange-500" },
  { value: "live_session", label: "Live Session", icon: Calendar, color: "text-pink-500" },
];

interface EnhancedLessonEditorProps {
  lesson: any;
  content: any;
  courseId: string;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function EnhancedLessonEditor({
  lesson,
  content,
  courseId,
  open,
  onClose,
  onUpdate,
}: EnhancedLessonEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  
  // Lesson metadata
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [contentType, setContentType] = useState(lesson?.content_type || "video");
  const [duration, setDuration] = useState(lesson?.duration_minutes?.toString() || "");
  
  // Content state
  const [richContent, setRichContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoProvider, setVideoProvider] = useState<"youtube" | "vimeo" | "mux" | "custom" | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  
  // Live session data
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [recordingLink, setRecordingLink] = useState("");

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || "");
      setDescription(lesson.description || "");
      setContentType(lesson.content_type || "video");
      setDuration(lesson.duration_minutes?.toString() || "");
    }
  }, [lesson]);

  useEffect(() => {
    if (content) {
      setRichContent(content.content || "");
      setVideoUrl(content.video_url || "");
      setVideoProvider(content.video_provider || null);
      setDownloadUrl(content.download_url || "");
      
      // Parse live session data
      if (content.live_session_data) {
        try {
          const sessionData = JSON.parse(content.live_session_data);
          setSessionDate(sessionData.date || "");
          setSessionTime(sessionData.time || "");
          setMeetingLink(sessionData.meeting_link || "");
          setRecordingLink(sessionData.recording_link || "");
        } catch (e) {
          console.error("Error parsing live session data:", e);
        }
      }
    }
  }, [content]);

  const detectVideoProvider = (url: string): "youtube" | "vimeo" | "mux" | "custom" | null => {
    if (!url) return null;
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    if (url.includes("vimeo.com")) return "vimeo";
    if (url.includes("mux.com")) return "mux";
    return "custom";
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    setVideoProvider(detectVideoProvider(url));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update lesson metadata
      const lessonResponse = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || null,
          content_type: contentType,
          duration_minutes: duration ? parseInt(duration) : null,
        }),
      });

      const lessonData = await lessonResponse.json();
      if (!lessonData.success) {
        throw new Error(lessonData.error || "Failed to update lesson");
      }

      // Update lesson content based on type
      const contentData: any = {
        lesson_id: lesson.id,
        content: richContent,
        video_url: null,
        video_provider: null,
        download_url: null,
        live_session_data: null,
      };

      if (contentType === "video" || contentType === "interactive_video") {
        contentData.video_url = videoUrl || null;
        contentData.video_provider = videoProvider;
      } else if (contentType === "download") {
        contentData.download_url = downloadUrl || null;
      } else if (contentType === "live_session") {
        contentData.live_session_data = JSON.stringify({
          date: sessionDate,
          time: sessionTime,
          meeting_link: meetingLink,
          recording_link: recordingLink,
        });
      }

      const contentResponse = await fetch(`/api/admin/lessons/${lesson.id}/content`, {
        method: content ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });

      const contentDataResult = await contentResponse.json();
      if (!contentDataResult.success) {
        throw new Error(contentDataResult.error || "Failed to update content");
      }

      showToast("Lesson saved successfully!", "success");
      onUpdate();
      onClose();
    } catch (error: any) {
      console.error("Error saving lesson:", error);
      showToast(error.message || "Failed to save lesson", "error");
    } finally {
      setSaving(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      ["blockquote", "code-block"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };

  const contentTypeConfig = CONTENT_TYPES.find((ct) => ct.value === contentType);
  const ContentIcon = contentTypeConfig?.icon || FileText;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ContentIcon className={`h-5 w-5 ${contentTypeConfig?.color || ""}`} />
            Edit Lesson
          </DialogTitle>
          <DialogDescription>
            Update lesson details and content. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lesson-title">Title *</Label>
                  <Input
                    id="lesson-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter lesson title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lesson-description">Description</Label>
                  <Textarea
                    id="lesson-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will students learn in this lesson?"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="content-type">Content Type *</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <Icon className={`h-4 w-4 ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="e.g., 15"
                      min="0"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            {contentType === "text" && (
              <Card>
                <CardHeader>
                  <CardTitle>Text Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="min-h-[400px]">
                    <ReactQuill
                      theme="snow"
                      value={richContent}
                      onChange={setRichContent}
                      modules={quillModules}
                      placeholder="Write your lesson content here..."
                      style={{ minHeight: "350px" }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {(contentType === "video" || contentType === "interactive_video") && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      value={videoUrl}
                      onChange={(e) => handleVideoUrlChange(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a YouTube, Vimeo, or custom video URL
                    </p>
                  </div>

                  {videoUrl && videoProvider && (
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
                  )}

                  {contentType === "interactive_video" && videoUrl && (
                    <InteractiveVideoEditor
                      lessonId={lesson.id}
                      videoUrl={videoUrl}
                      videoProvider={videoProvider}
                      initialInteractions={content?.video_interactions ? JSON.parse(content.video_interactions) : []}
                      onSave={async (interactions) => {
                        const response = await fetch(`/api/admin/lessons/${lesson.id}/content`, {
                          method: content ? "PATCH" : "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            lesson_id: lesson.id,
                            video_url: videoUrl,
                            video_provider: videoProvider,
                            video_interactions: JSON.stringify(interactions),
                          }),
                        });
                        const data = await response.json();
                        if (!data.success) {
                          throw new Error(data.error || "Failed to save interactive video");
                        }
                      }}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {contentType === "quiz" && (
              <Card>
                <CardHeader>
                  <CardTitle>Quiz Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <QuizBuilder
                    lessonId={lesson.id}
                    initialQuestions={content?.quiz_data ? JSON.parse(content.quiz_data).questions || [] : []}
                    initialSettings={content?.quiz_data ? JSON.parse(content.quiz_data).settings || {
                      passingScore: 70,
                      retakeLimit: null,
                      randomizeQuestions: false,
                      timeLimit: null,
                      showCorrectAnswers: true,
                    } : {
                      passingScore: 70,
                      retakeLimit: null,
                      randomizeQuestions: false,
                      timeLimit: null,
                      showCorrectAnswers: true,
                    }}
                    onSave={async (questions, settings) => {
                      const quizData = JSON.stringify({ questions, settings });
                      const response = await fetch(`/api/admin/lessons/${lesson.id}/content`, {
                        method: content ? "PATCH" : "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          lesson_id: lesson.id,
                          quiz_data: quizData,
                        }),
                      });
                      const data = await response.json();
                      if (!data.success) {
                        throw new Error(data.error || "Failed to save quiz");
                      }
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {contentType === "download" && (
              <Card>
                <CardHeader>
                  <CardTitle>Downloadable Resource</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="download-url">Download URL</Label>
                    <Input
                      id="download-url"
                      value={downloadUrl}
                      onChange={(e) => setDownloadUrl(e.target.value)}
                      placeholder="https://... or upload a file"
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a direct download link or upload a file (PDF, DOCX, etc.)
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {contentType === "live_session" && (
              <Card>
                <CardHeader>
                  <CardTitle>Live Session Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-date">Date</Label>
                      <Input
                        id="session-date"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="session-time">Time</Label>
                      <Input
                        id="session-time"
                        type="time"
                        value={sessionTime}
                        onChange={(e) => setSessionTime(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meeting-link">Meeting Link</Label>
                    <Input
                      id="meeting-link"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="recording-link">Recording Link (Optional)</Label>
                    <Input
                      id="recording-link"
                      value={recordingLink}
                      onChange={(e) => setRecordingLink(e.target.value)}
                      placeholder="Link to session recording for replay"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Lesson Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold">{title || "Untitled Lesson"}</h3>
                    {description && <p className="text-muted-foreground mt-2">{description}</p>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="capitalize">{contentType.replace("_", " ")}</span>
                    {duration && <span>• {duration} minutes</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !title.trim()}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Lesson
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

