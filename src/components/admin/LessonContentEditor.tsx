"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, Video, FileText, Upload, X } from "lucide-react";
import dynamic from "next/dynamic";
import { showToast } from "@/components/ui/toast";
import { compressImage } from "@/lib/storage/image-optimization";

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

interface LessonContentEditorProps {
  courseId: string;
  lesson: any;
  content: any;
  onUpdate: () => void;
}

export function LessonContentEditor({ courseId, lesson, content, onUpdate }: LessonContentEditorProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  
  // Content state
  const [richContent, setRichContent] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoProvider, setVideoProvider] = useState<"youtube" | "vimeo" | "mux" | "custom" | null>(null);
  const [downloadUrl, setDownloadUrl] = useState("");
  
  // Media upload
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (content) {
      setRichContent(content.content || "");
      setVideoUrl(content.video_url || "");
      setVideoProvider(content.video_provider || null);
      setDownloadUrl(content.download_url || "");
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

  const saveContent = async (showNotification = false) => {
    setSaving(true);
    try {
      const contentData = {
        lesson_id: lesson.id,
        content: richContent,
        video_url: videoUrl || null,
        video_provider: videoProvider,
        download_url: downloadUrl || null,
      };

      const response = await fetch(`/api/admin/lessons/${lesson.id}/content`, {
        method: content ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contentData),
      });

      const data = await response.json();
      if (data.success) {
        setLastSaved(new Date());
        if (showNotification) {
          showToast("Content saved successfully!", "success");
        }
        onUpdate();
      } else {
        if (showNotification) {
          showToast(data.error || "Failed to save content", "error");
        }
      }
    } catch (error) {
      console.error("Error saving content:", error);
      if (showNotification) {
        showToast("Failed to save content. Please try again.", "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => saveContent(true);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !hasChanges) return;

    const timer = setTimeout(() => {
      saveContent(false);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [richContent, videoUrl, downloadUrl, autoSaveEnabled]);

  const handleFileUpload = async (file: File, type: "image" | "video" | "document") => {
    setUploading(true);
    setUploadProgress(0);

    try {
      let fileToUpload = file;

      // Compress images before upload
      if (type === "image" && file.size > 500000) {
        // Compress if larger than 500KB
        showToast("Compressing image...", "info");
        try {
          fileToUpload = await compressImage(file, 1920, 0.8);
          showToast("Image compressed successfully", "success", 2000);
        } catch (error) {
          console.error("Error compressing image:", error);
          showToast("Failed to compress image, uploading original", "warning", 2000);
        }
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("type", type);
      formData.append("lessonId", lesson.id);

      showToast("Uploading file...", "info");

      const response = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        if (type === "video") {
          setVideoUrl(data.url);
          setVideoProvider(detectVideoProvider(data.url));
        } else if (type === "document") {
          setDownloadUrl(data.url);
        } else {
          // Insert image into rich text editor
          const imageHtml = `<img src="${data.url}" alt="Uploaded image" />`;
          setRichContent((prev) => prev + imageHtml);
        }
        showToast("File uploaded successfully!", "success");
      } else {
        showToast(data.error || "Failed to upload file", "error");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      showToast("Failed to upload file. Please try again.", "error");
    } finally {
      setUploading(false);
      setUploadProgress(0);
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

  const hasChanges = content
    ? richContent !== (content.content || "") ||
      videoUrl !== (content.video_url || "") ||
      downloadUrl !== (content.download_url || "")
    : richContent || videoUrl || downloadUrl;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
          {lesson.title}
        </h1>
        <p className="text-muted-foreground">
          Edit lesson content, videos, and downloadable resources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="downloads">Downloads</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Lesson Content</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("image-upload")?.click()}
                    disabled={uploading}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "image");
                    }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Label>Rich Text Content</Label>
                <div className="min-h-[400px]">
                  <ReactQuill
                    theme="snow"
                    value={richContent}
                    onChange={(value) => {
                      setRichContent(value);
                    }}
                    modules={quillModules}
                    placeholder="Write your lesson content here..."
                    style={{ minHeight: "350px" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Use the toolbar to format text, add images, links, and more.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Video Content</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("video-upload")?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Video
                </Button>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "video");
                  }}
                />
              </div>
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
                  Enter a YouTube, Vimeo, or custom video URL. Or upload a video file above.
                </p>
              </div>

              {videoProvider && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Video className="h-4 w-4" />
                    <span className="font-medium">Provider: {videoProvider}</span>
                  </div>
                  {videoProvider === "youtube" && (
                    <p className="text-sm text-muted-foreground">
                      YouTube videos will be embedded automatically.
                    </p>
                  )}
                  {videoProvider === "vimeo" && (
                    <p className="text-sm text-muted-foreground">
                      Vimeo videos will be embedded automatically.
                    </p>
                  )}
                </div>
              )}

              {videoUrl && (
                <div className="mt-4">
                  <Label>Preview</Label>
                  <div className="mt-2 aspect-video bg-muted rounded-lg overflow-hidden">
                    {videoProvider === "youtube" ? (
                      <iframe
                        src={(() => {
                          // Handle various YouTube URL formats
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
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    ) : videoProvider === "vimeo" ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${videoUrl.split("/").pop()?.split("?")[0]}`}
                        className="w-full h-full"
                        allowFullScreen
                        allow="autoplay; fullscreen; picture-in-picture"
                      />
                    ) : (
                      <video src={videoUrl} controls className="w-full h-full rounded-lg" />
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="downloads" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Downloadable Resources</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("document-upload")?.click()}
                  disabled={uploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
                <input
                  id="document-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file, "document");
                  }}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="download-url">Download URL</Label>
                <Input
                  id="download-url"
                  value={downloadUrl}
                  onChange={(e) => setDownloadUrl(e.target.value)}
                  placeholder="https://... or upload a file above"
                />
                <p className="text-xs text-muted-foreground">
                  Enter a direct download link or upload a file (PDF, DOCX, etc.)
                </p>
              </div>

              {downloadUrl && (
                <div className="p-4 bg-muted rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">Download available</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDownloadUrl("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 bg-background border-t p-4 rounded-t-lg shadow-lg">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            {hasChanges ? (
              <p className="text-sm text-muted-foreground">
                {saving ? "Saving..." : "Unsaved changes"}
              </p>
            ) : lastSaved ? (
              <p className="text-sm text-green-600">
                Saved {lastSaved.toLocaleTimeString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">All changes saved</p>
            )}
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded"
              />
              Auto-save
            </label>
          </div>
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

