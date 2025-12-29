"use client";

import { Container } from "@/components/layout/Container";
import { CourseWizard } from "@/components/admin/CourseWizard";
import { StripeWarningBanner } from "@/components/admin/StripeWarningBanner";

export default function NewCoursePage() {
  const handleComplete = (course: any) => {
    // Course creation handled by wizard, will redirect to builder
    console.log("Course created:", course);
  };

  return (
    <div className="p-8">
      <Container className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Create New Course
          </h1>
          <p className="text-muted-foreground">
            Use AI to quickly generate a course structure or create one manually
          </p>
        </div>

        {/* Stripe Warning Banner */}
        <StripeWarningBanner className="mb-6" />

        <CourseWizard onComplete={handleComplete} />
      </Container>
    </div>
  );
}
