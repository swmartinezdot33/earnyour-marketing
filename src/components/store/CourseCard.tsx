"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, ShoppingCart } from "lucide-react";
import type { Course } from "@/lib/db/schema";
import { useCart } from "@/contexts/CartContext";

interface CourseCardProps {
  course: Course;
  showPreview?: boolean;
}

export function CourseCard({ course, showPreview = true }: CourseCardProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart("course", course.id);

  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow">
      {course.image_url && (
        <Link href={`/store/${course.slug}`}>
          <div className="aspect-video bg-muted rounded-t-xl overflow-hidden relative">
            <img
              src={course.image_url}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {course.featured && (
              <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            {course.category && (
              <Badge variant="secondary" className="absolute top-2 left-2">
                {course.category}
              </Badge>
            )}
          </div>
        </Link>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link href={`/store/${course.slug}`} className="hover:text-primary">
            {course.title}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {course.short_description || course.description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-2xl font-bold text-brand-navy">
            ${course.price}
          </span>
        </div>
        <div className="flex gap-2">
          {showPreview && course.preview_lesson_id && (
            <Link href={`/store/${course.slug}/preview`} className="flex-1">
              <Button variant="outline" className="w-full" size="sm">
                <Play className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </Link>
          )}
          <Button
            onClick={() => addToCart("course", course.id, course.title, course.price, course.image_url)}
            className="flex-1"
            size="sm"
            disabled={inCart}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {inCart ? "In Cart" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

