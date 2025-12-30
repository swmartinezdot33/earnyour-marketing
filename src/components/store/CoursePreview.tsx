"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart, Lock } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { Course, Lesson, LessonContent } from "@/lib/db/schema";

interface CoursePreviewProps {
  course: Course;
  lesson: Lesson;
  content: LessonContent | null;
}

export function CoursePreviewClient({ course, lesson, content }: CoursePreviewProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart("course", course.id);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{lesson.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lesson.description && (
            <p className="text-muted-foreground">{lesson.description}</p>
          )}

          {content && (
            <div className="space-y-4">
              {content.video_url && (
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {content.video_provider === "youtube" ? (
                    <iframe
                      src={content.video_url.replace("watch?v=", "embed/")}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={content.video_url}
                      controls
                      className="w-full h-full"
                    />
                  )}
                </div>
              )}

              {content.content && (
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: content.content }}
                />
              )}
            </div>
          )}

          <div className="border-t pt-6 mt-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-4">
              <Lock className="h-5 w-5 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                This is a preview lesson. Enroll in the full course to access all content.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                onClick={() => addToCart("course", course.id, course.title, course.price, course.image_url)}
                disabled={inCart}
                className="flex-1"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {inCart ? "In Cart" : "Add to Cart"}
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/store/${course.slug}`}>View Full Course</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

