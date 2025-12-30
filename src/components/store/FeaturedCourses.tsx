"use client";

import { CourseCard } from "./CourseCard";
import type { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Star } from "lucide-react";

interface FeaturedCoursesProps {
  courses: Course[];
}

export function FeaturedCourses({ courses }: FeaturedCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <Section className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
      <Container>
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
            <h2 className="text-3xl md:text-4xl font-bold font-heading">
              Featured Courses
            </h2>
            <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
          </div>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Start with our most popular courses trusted by thousands of students
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

