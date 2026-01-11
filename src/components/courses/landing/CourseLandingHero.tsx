"use client";

import Link from "next/link";
import { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { ArrowRight } from "lucide-react";

interface CourseLandingHeroProps {
  course: Course;
  enrolled: boolean;
  courseSlug: string;
}

export function CourseLandingHero({
  course,
  enrolled,
  courseSlug,
}: CourseLandingHeroProps) {
  return (
    <Section className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white pt-24 pb-16 md:pt-32 md:pb-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
              {course.title}
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              {course.short_description || course.description}
            </p>
            
            {/* Price Display */}
            <div className="mb-8 flex items-baseline gap-3">
              <span className="text-5xl font-bold">${course.price}</span>
              <span className="text-white/70 text-lg">one-time payment</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {enrolled ? (
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 h-14 px-8 text-lg"
                  asChild
                >
                  <Link href={`/courses/${courseSlug}/learn`}>
                    Continue Learning <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <PurchaseButton courseId={course.id} price={course.price} />
              )}
              
              <Button 
                size="lg" 
                variant="outline" 
                className="h-14 px-8 text-lg border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <a href="#curriculum">
                  See What's Inside <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
          </div>

          {/* Right Content - Course Image */}
          {course.image_url && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl"></div>
              <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
