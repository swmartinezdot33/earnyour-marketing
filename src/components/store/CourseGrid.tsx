"use client";

import { useState, useMemo } from "react";
import { CourseCard } from "./CourseCard";
import { SearchBar } from "./SearchBar";
import { CategoryFilter } from "./CategoryFilter";
import type { Course } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

interface CourseGridProps {
  courses: Course[];
}

export function CourseGrid({ courses }: CourseGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = courses
      .map((c) => c.category)
      .filter((c): c is string => c !== null && c !== undefined);
    return Array.from(new Set(cats)).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(term) ||
          c.description?.toLowerCase().includes(term) ||
          c.short_description?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [courses, selectedCategory, searchTerm]);

  return (
    <Section>
      <Container>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar onSearch={setSearchTerm} />
            </div>
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              Found {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} matching "{searchTerm}"
            </p>
          )}
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              {searchTerm || selectedCategory
                ? "No courses found matching your criteria."
                : "No courses available yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </Container>
    </Section>
  );
}

