"use client";

import { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Zap, Award } from "lucide-react";

interface CourseFeaturesProps {
  course: Course;
}

const featureItems = [
  {
    icon: BookOpen,
    title: "Comprehensive Content",
    description: "Well-structured, easy-to-follow lessons designed for maximum learning retention.",
  },
  {
    icon: Users,
    title: "Learn at Your Pace",
    description: "Access all course materials anytime, anywhere. No schedules or deadlines.",
  },
  {
    icon: Zap,
    title: "Practical Skills",
    description: "Real-world techniques and strategies you can implement immediately.",
  },
  {
    icon: Award,
    title: "Lifetime Access",
    description: "One payment, lifetime access to all course materials and updates.",
  },
];

export function CourseFeatures({ course }: CourseFeaturesProps) {
  return (
    <Section variant="sand">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-12 text-center">
            Course Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureItems.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-none shadow-sm bg-white">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-primary mb-3" />
                    <CardTitle className="text-xl text-brand-navy">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-navy/70">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}
