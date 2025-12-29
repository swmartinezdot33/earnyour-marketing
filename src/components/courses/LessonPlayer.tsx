"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Download, Calendar, Clock, BookOpen, Link as LinkIcon, FileText } from "lucide-react";
import type { Lesson, LessonContent, Progress } from "@/lib/db/schema";
import type { VideoInteraction } from "@/components/admin/InteractiveVideoEditor";
import type { QuizQuestion, QuizSettings } from "@/components/admin/QuizBuilder";

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
  const [quizAnswers, setQuizAnswers] = useState<Record<string, any>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [activeInteraction, setActiveInteraction] = useState<VideoInteraction | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const videoInteractions: VideoInteraction[] = content?.video_interactions
    ? JSON.parse(content.video_interactions)
    : [];

  const quizData: { questions: QuizQuestion[]; settings: QuizSettings } | null = content?.quiz_data
    ? JSON.parse(content.quiz_data)
    : null;

  const liveSessionData = content?.live_session_data
    ? JSON.parse(content.live_session_data)
    : null;

  useEffect(() => {
    // Check for active interactions based on video time
    if (lesson.content_type === "interactive_video" && videoInteractions.length > 0) {
      const active = videoInteractions.find(
        (interaction) =>
          currentTime >= interaction.timestamp - 2 && currentTime <= interaction.timestamp + 5
      );
      setActiveInteraction(active || null);
    }
  }, [currentTime, lesson.content_type, videoInteractions]);

  const handleMarkComplete = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/courses/${courseSlug}/lessons/${lesson.id}/complete`, {
        method: "POST",
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

  const handleQuizAnswer = (questionId: string, answer: any) => {
    setQuizAnswers({ ...quizAnswers, [questionId]: answer });
  };

  const handleSubmitQuiz = () => {
    if (!quizData) return;

    let correct = 0;
    let total = 0;

    quizData.questions.forEach((question) => {
      total += question.points;
      const userAnswer = quizAnswers[question.id];
      const correctAnswer = question.correctAnswers;

      if (question.type === "multiple_choice" || question.type === "true_false") {
        if (userAnswer === correctAnswer?.[0]) {
          correct += question.points;
        }
      } else if (question.type === "multiple_select") {
        const userSet = new Set(Array.isArray(userAnswer) ? userAnswer : [userAnswer]);
        const correctSet = new Set(correctAnswer || []);
        if (userSet.size === correctSet.size && [...userSet].every((a) => correctSet.has(a))) {
          correct += question.points;
        }
      } else if (question.type === "short_answer" || question.type === "essay") {
        // Manual grading - assume correct for now
        if (userAnswer && userAnswer.trim()) {
          correct += question.points;
        }
      } else if (question.type === "matching") {
        // Compare matching pairs
        const userPairs = userAnswer || [];
        const correctPairs = question.matchingPairs || [];
        let matches = 0;
        userPairs.forEach((pair: any, index: number) => {
          if (
            correctPairs[index] &&
            pair.left === correctPairs[index].left &&
            pair.right === correctPairs[index].right
          ) {
            matches++;
          }
        });
        if (matches === correctPairs.length) {
          correct += question.points;
        }
      } else if (question.type === "fill_blank") {
        const userBlanks = userAnswer || [];
        const correctBlanks = question.blanks || [];
        let matches = 0;
        userBlanks.forEach((blank: any, index: number) => {
          if (
            correctBlanks[index] &&
            blank.toLowerCase().trim() === correctBlanks[index].answer.toLowerCase().trim()
          ) {
            matches++;
          }
        });
        if (matches === correctBlanks.length) {
          correct += question.points;
        }
      }
    });

    const score = total > 0 ? Math.round((correct / total) * 100) : 0;
    setQuizScore(score);
    setQuizSubmitted(true);

    // Mark as complete if passing score is met
    if (score >= quizData.settings.passingScore) {
      handleMarkComplete();
    }
  };

  const formatTimestamp = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
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
      {/* Interactive Video Player */}
      {(lesson.content_type === "video" || lesson.content_type === "interactive_video") &&
        content.video_url && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
              {content.video_provider === "youtube" ? (
                <iframe
                  ref={iframeRef}
                  src={(() => {
                    const url = content.video_url!;
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
              ) : content.video_provider === "vimeo" ? (
                <iframe
                  ref={iframeRef}
                  src={`https://player.vimeo.com/video/${content.video_url.split("/").pop()?.split("?")[0]}`}
                  className="w-full h-full"
                  allowFullScreen
                  allow="autoplay; fullscreen; picture-in-picture"
                />
              ) : (
                <video
                  ref={videoRef}
                  src={content.video_url}
                  controls
                  className="w-full h-full"
                  onTimeUpdate={() => {
                    if (videoRef.current) {
                      const video = videoRef.current;
                      setCurrentTime(video.currentTime);
                      const progressPercent = (video.currentTime / video.duration) * 100;
                      fetch(`/api/lessons/${lesson.id}/progress`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          progress_percentage: Math.round(progressPercent),
                          last_position: Math.round(video.currentTime),
                        }),
                      }).catch(console.error);
                    }
                  }}
                  onLoadedMetadata={() => {
                    if (progress?.last_position && videoRef.current) {
                      videoRef.current.currentTime = progress.last_position;
                    }
                  }}
                />
              )}

              {/* Interactive Elements Overlay */}
              {lesson.content_type === "interactive_video" && activeInteraction && (
                <div className="absolute bottom-4 left-4 right-4 bg-background/95 border rounded-lg p-4 shadow-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {activeInteraction.type === "bookmark" && <BookOpen className="h-4 w-4" />}
                      {activeInteraction.type === "question" && <FileText className="h-4 w-4" />}
                      {activeInteraction.type === "resource" && <LinkIcon className="h-4 w-4" />}
                      {activeInteraction.type === "chapter" && <Clock className="h-4 w-4" />}
                      <span className="font-medium">{activeInteraction.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveInteraction(null)}
                    >
                      ×
                    </Button>
                  </div>
                  {activeInteraction.content && (
                    <p className="text-sm text-muted-foreground mb-2">{activeInteraction.content}</p>
                  )}
                  {activeInteraction.url && (
                    <a
                      href={activeInteraction.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm"
                    >
                      View Resource →
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Timeline */}
            {lesson.content_type === "interactive_video" && videoInteractions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Video Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {videoInteractions.map((interaction) => {
                      const Icon =
                        interaction.type === "bookmark"
                          ? BookOpen
                          : interaction.type === "question"
                            ? FileText
                            : interaction.type === "resource"
                              ? LinkIcon
                              : Clock;
                      return (
                        <div
                          key={interaction.id}
                          className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer"
                          onClick={() => {
                            if (videoRef.current) {
                              videoRef.current.currentTime = interaction.timestamp;
                            }
                            setActiveInteraction(interaction);
                          }}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-mono text-muted-foreground">
                            {formatTimestamp(interaction.timestamp)}
                          </span>
                          <span className="text-sm flex-1">{interaction.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      {/* Text Content */}
      {lesson.content_type === "text" && content.content && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
        </div>
      )}

      {/* Quiz */}
      {lesson.content_type === "quiz" && quizData && (
        <div className="space-y-6">
          {quizData.settings.timeLimit && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">
                    Time Limit: {quizData.settings.timeLimit} minutes
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {quizData.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg">
                  Question {index + 1} ({question.points} {question.points === 1 ? "point" : "points"})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="font-medium">{question.question}</p>

                {question.type === "multiple_choice" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optIndex}
                          checked={quizAnswers[question.id] === optIndex}
                          onChange={() => handleQuizAnswer(question.id, optIndex)}
                          disabled={quizSubmitted}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                        {quizSubmitted &&
                          question.correctAnswers?.includes(optIndex) && (
                            <span className="ml-auto text-green-600">✓ Correct</span>
                          )}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "multiple_select" && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(quizAnswers[question.id])
                              ? quizAnswers[question.id].includes(optIndex)
                              : false
                          }
                          onChange={(e) => {
                            const current = Array.isArray(quizAnswers[question.id])
                              ? quizAnswers[question.id]
                              : [];
                            const updated = e.target.checked
                              ? [...current, optIndex]
                              : current.filter((a: number) => a !== optIndex);
                            handleQuizAnswer(question.id, updated);
                          }}
                          disabled={quizSubmitted}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                        {quizSubmitted &&
                          question.correctAnswers?.includes(optIndex) && (
                            <span className="ml-auto text-green-600">✓ Correct</span>
                          )}
                      </label>
                    ))}
                  </div>
                )}

                {question.type === "true_false" && (
                  <div className="space-y-2">
                    {["True", "False"].map((option, optIndex) => (
                      <label
                        key={optIndex}
                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={optIndex}
                          checked={quizAnswers[question.id] === optIndex}
                          onChange={() => handleQuizAnswer(question.id, optIndex)}
                          disabled={quizSubmitted}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                        {quizSubmitted &&
                          question.correctAnswers?.includes(optIndex) && (
                            <span className="ml-auto text-green-600">✓ Correct</span>
                          )}
                      </label>
                    ))}
                  </div>
                )}

                {(question.type === "short_answer" || question.type === "essay") && (
                  <textarea
                    value={quizAnswers[question.id] || ""}
                    onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                    disabled={quizSubmitted}
                    className="w-full min-h-[100px] p-3 border rounded-lg"
                    placeholder="Enter your answer..."
                  />
                )}

                {question.explanation && quizSubmitted && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-1">Explanation:</p>
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {quizSubmitted && quizScore !== null && (
            <Card className={quizScore >= quizData.settings.passingScore ? "border-green-500" : "border-red-500"}>
              <CardContent className="p-6 text-center">
                <h3 className="text-2xl font-bold mb-2">
                  Score: {quizScore}%
                </h3>
                <p className="text-muted-foreground">
                  Passing Score: {quizData.settings.passingScore}%
                </p>
                {quizScore >= quizData.settings.passingScore ? (
                  <p className="text-green-600 font-medium mt-2">Congratulations! You passed!</p>
                ) : (
                  <p className="text-red-600 font-medium mt-2">
                    You need to score {quizData.settings.passingScore}% to pass.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {!quizSubmitted && (
            <Button onClick={handleSubmitQuiz} size="lg" className="w-full">
              Submit Quiz
            </Button>
          )}
        </div>
      )}

      {/* Live Session */}
      {lesson.content_type === "live_session" && liveSessionData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Live Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Date & Time</p>
              <p className="font-medium">
                {liveSessionData.date && new Date(liveSessionData.date).toLocaleDateString()}{" "}
                {liveSessionData.time && liveSessionData.time}
              </p>
            </div>

            {liveSessionData.meeting_link && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
                <a
                  href={liveSessionData.meeting_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  {liveSessionData.meeting_link}
                </a>
              </div>
            )}

            {liveSessionData.recording_link && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Recording</p>
                <a
                  href={liveSessionData.recording_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Watch Recording
                </a>
              </div>
            )}
          </CardContent>
        </Card>
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

      {/* Rich Content (for any content type) */}
      {content.content && lesson.content_type !== "text" && lesson.content_type !== "quiz" && (
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: content.content }} />
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
          <Button onClick={handleMarkComplete} disabled={saving || (lesson.content_type === "quiz" && !quizSubmitted)}>
            {saving ? "Saving..." : "Mark as Complete"}
          </Button>
        )}
      </div>
    </div>
  );
}
