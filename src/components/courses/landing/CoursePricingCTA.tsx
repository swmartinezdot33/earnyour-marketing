"use client";

import Link from "next/link";
import { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Button } from "@/components/ui/button";
import { PurchaseButton } from "@/components/courses/PurchaseButton";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface CoursePricingCTAProps {
  course: Course;
  enrolled: boolean;
  courseSlug: string;
}

export function CoursePricingCTA({
  course,
  enrolled,
  courseSlug,
}: CoursePricingCTAProps) {
  return (
    <Section className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
      <Container>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/80 mb-8">
            Join students who are already mastering the skills in this course.
          </p>

          {/* Pricing Display */}
          <div className="bg-white/10 backdrop-blur rounded-xl p-8 mb-12 border border-white/20">
            <div className="flex items-baseline justify-center gap-3 mb-6">
              <span className="text-6xl font-bold">${course.price}</span>
              <span className="text-xl text-white/70">one-time payment</span>
            </div>
            <p className="text-white/80 mb-8">
              Lifetime access to all course materials and future updates
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-8 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Lifetime access to all materials</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Learn at your own pace</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Completion certificate included</span>
              </div>
            </div>

            {/* CTA Button */}
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
          </div>

          {/* Risk-Free Guarantee */}
          <p className="text-white/70 text-sm">
            Not sure? Contact us for more information before enrolling.
          </p>
        </div>
      </Container>
    </Section>
  );
}
