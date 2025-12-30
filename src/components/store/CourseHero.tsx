"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Play, ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import type { Course } from "@/lib/db/schema";

interface CourseHeroProps {
  course: Course;
}

export function CourseHero({ course }: CourseHeroProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart("course", course.id);

  return (
    <Section className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white pt-24 pb-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex gap-2 mb-4">
              {course.featured && (
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
              {course.category && (
                <Badge variant="secondary">{course.category}</Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {course.title}
            </h1>
            <p className="text-xl text-white/80 mb-8">
              {course.short_description || course.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {course.preview_lesson_id && (
                <Button asChild variant="outline" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                  <Link href={`/store/${course.slug}/preview`}>
                    <Play className="mr-2 h-5 w-5" />
                    Preview Course
                  </Link>
                </Button>
              )}
              <Button
                onClick={() => addToCart("course", course.id, course.title, course.price, course.image_url)}
                size="lg"
                disabled={inCart}
                className="bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {inCart ? "In Cart" : `Add to Cart - $${course.price}`}
              </Button>
            </div>
          </div>
          {course.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                src={course.image_url}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

