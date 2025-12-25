"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Download } from "lucide-react";
import type { Lesson, LessonContent, Progress } from "@/lib/db/schema";

interface LessonPlayerProps {
  lesson: Lesson;
  content: LessonContent | null;
  progress: Progress | null;
  userId: string;
  courseSlug: string;
}

export function LessonPlayer({ lesson, content, progress, userId, courseSlug }: LessonPlayerProps) {
  const [completed, setCompleted] = useState(progress?.completed || false);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/lessons/${lesson.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          completed: true,
          progress_percentage: 100,
        }),
      });

      if (response.ok) {
        setCompleted(true);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
    } finally {
      setSaving(false);
    }
  };

  if (!content) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Lesson content is being prepared. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Video Player */}
      {lesson.content_type === "video" && content.video_url && (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            src={content.video_url}
            controls
            className="w-full h-full"
            onTimeUpdate={() => {
              if (videoRef.current) {
                const video = videoRef.current;
                const progress = (video.currentTime / video.duration) * 100;
                fetch(`/api/lessons/${lesson.id}/progress`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    progress_percentage: Math.round(progress),
                    last_position: Math.round(video.currentTime),
                  }),
                }).catch(console.error);
              }
            }}
            onLoadedMetadata={() => {
              // Resume from last position
              if (progress?.last_position && videoRef.current) {
                videoRef.current.currentTime = progress.last_position;
              }
            }}
          />
        </div>
      )}

      {/* Text Content */}
      {lesson.content_type === "text" && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </div>
      )}

      {/* Quiz */}
      {lesson.content_type === "quiz" && content.quiz_data && (
        <div>
          <p className="text-muted-foreground mb-4">Quiz functionality coming soon!</p>
          <pre className="bg-muted p-4 rounded text-sm overflow-auto">
            {content.quiz_data}
          </pre>
        </div>
      )}

      {/* Download */}
      {lesson.content_type === "download" && content.download_url && (
        <div className="border rounded-lg p-6 text-center">
          <Download className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Download Resource</h3>
          <p className="text-muted-foreground mb-4">Click below to download this resource</p>
          <a href={content.download_url} download>
            <Button>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </a>
        </div>
      )}

      {/* Completion Button */}
      <div className="flex justify-between items-center pt-6 border-t">
        {completed ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-semibold">Lesson Completed</span>
          </div>
        ) : (
          <Button onClick={handleMarkComplete} disabled={saving}>
            {saving ? "Saving..." : "Mark as Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}

