"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseFilters } from "./CourseFilters";
import { BulkActionsBar } from "./BulkActionsBar";
import { ExportButton } from "./ExportButton";
import { DeleteCourseDialog } from "./DeleteCourseDialog";
import { showToast } from "@/components/ui/toast";
import { arrayToCSV, downloadCSV, formatDateForCSV } from "@/lib/utils/export";
import type { Course } from "@/lib/db/schema";

interface CourseWithStats extends Course {
  enrollmentCount?: number;
  revenue?: number;
  completionRate?: number;
}

interface EnhancedCourseListProps {
  initialCourses: Course[];
}

export function EnhancedCourseList({ initialCourses }: EnhancedCourseListProps) {
  const [courses, setCourses] = useState<CourseWithStats[]>(initialCourses);
  const [filteredCourses, setFilteredCourses] = useState<CourseWithStats[]>(initialCourses);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    search?: string;
    status?: "published" | "draft" | "all";
    dateFrom?: Date;
    dateTo?: Date;
    minPrice?: number;
    maxPrice?: number;
  }>({});
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch course stats
  useEffect(() => {
    async function fetchCourseStats() {
      setLoading(true);
      try {
        const response = await fetch("/api/admin/courses/stats");
        if (!response.ok) {
          throw new Error("Failed to fetch course stats");
        }
        const { enrollmentsByCourse, revenueByCourse } = await response.json();

        const coursesWithStats = initialCourses.map((course) => {
          const enrollments = enrollmentsByCourse[course.id] || { total: 0, completed: 0 };
          return {
            ...course,
            enrollmentCount: enrollments.total,
            revenue: revenueByCourse[course.id] || 0,
            completionRate: enrollments.total > 0
              ? (enrollments.completed / enrollments.total) * 100
              : 0,
          };
        });

        setCourses(coursesWithStats);
        setFilteredCourses(coursesWithStats);
      } catch (error) {
        console.error("Error fetching course stats:", error);
        setCourses(initialCourses);
        setFilteredCourses(initialCourses);
      } finally {
        setLoading(false);
      }
    }

    fetchCourseStats();
  }, [initialCourses]);

  // Apply filters
  useEffect(() => {
    let filtered = [...courses];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.short_description?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((c) =>
        filters.status === "published" ? c.published : !c.published
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (c) => new Date(c.created_at) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (c) => new Date(c.created_at) <= filters.dateTo!
      );
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((c) => c.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((c) => c.price <= filters.maxPrice!);
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCourses(new Set(filteredCourses.map((c) => c.id)));
    } else {
      setSelectedCourses(new Set());
    }
  };

  const handleSelectCourse = (courseId: string, checked: boolean) => {
    const newSelected = new Set(selectedCourses);
    if (checked) {
      newSelected.add(courseId);
    } else {
      newSelected.delete(courseId);
    }
    setSelectedCourses(newSelected);
  };

  const handleBulkPublish = async () => {
    // TODO: Implement bulk publish
    console.log("Bulk publish:", Array.from(selectedCourses));
  };

  const handleBulkUnpublish = async () => {
    // TODO: Implement bulk unpublish
    console.log("Bulk unpublish:", Array.from(selectedCourses));
  };

  const handleBulkDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmBulkDelete = async () => {
    if (selectedCourses.size === 0) return;

    setDeleting(true);
    try {
      const courseIds = Array.from(selectedCourses);
      const deletePromises = courseIds.map((courseId) =>
        fetch(`/api/admin/courses/${courseId}`, {
          method: "DELETE",
        })
      );

      const results = await Promise.allSettled(deletePromises);
      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - successful;

      if (failed === 0) {
        showToast(
          `Successfully deleted ${successful} course${successful > 1 ? "s" : ""}`,
          "success"
        );
        // Remove deleted courses from state
        setCourses((prev) => prev.filter((c) => !selectedCourses.has(c.id)));
        setFilteredCourses((prev) => prev.filter((c) => !selectedCourses.has(c.id)));
        setSelectedCourses(new Set());
        setDeleteDialogOpen(false);
      } else {
        showToast(
          `Deleted ${successful} course${successful > 1 ? "s" : ""}, but ${failed} failed`,
          "warning"
        );
        // Refresh the list to get accurate state
        window.location.reload();
      }
    } catch (error) {
      console.error("Error deleting courses:", error);
      showToast("Failed to delete courses. Please try again.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    const csvData = filteredCourses.map((course) => ({
      Title: course.title,
      Slug: course.slug,
      Price: `$${course.price}`,
      Status: course.published ? "Published" : "Draft",
      Enrollments: course.enrollmentCount || 0,
      Revenue: `$${((course.revenue || 0) / 100).toFixed(2)}`,
      "Completion Rate": `${(course.completionRate || 0).toFixed(2)}%`,
      "Created At": formatDateForCSV(course.created_at),
    }));

    const csv = arrayToCSV(csvData);
    const filename = `courses-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <CourseFilters onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCourses.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedCourses.size}
          onBulkPublish={handleBulkPublish}
          onBulkUnpublish={handleBulkUnpublish}
          onBulkDelete={handleBulkDelete}
          onBulkExport={handleExport}
          actions={["publish", "unpublish", "delete", "export"]}
        />
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton onExport={handleExport} />
      </div>

      {/* Courses Grid */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading course statistics...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No courses match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course.id}
              className="h-full hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <Checkbox
                      checked={selectedCourses.has(course.id)}
                      onCheckedChange={(checked) =>
                        handleSelectCourse(course.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Link href={`/admin/courses/${course.id}/builder`}>
                        <CardTitle className="text-xl hover:text-primary transition-colors cursor-pointer">
                          {course.title}
                        </CardTitle>
                      </Link>
                      <Link href={`/admin/courses/${course.id}/builder`}>
                        <Button variant="link" size="sm" className="p-0 h-auto mt-1 text-primary">
                          Edit Course
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!course.published && (
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        Draft
                      </Badge>
                    )}
                    {course.published && !course.stripe_product_id && (
                      <Badge variant="outline" className="bg-orange-100 text-orange-800">
                        No Stripe
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.short_description || course.description}
                </p>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-bold text-brand-navy">${course.price}</span>
                  </div>
                  {course.enrollmentCount !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Enrollments:</span>
                      <span>{course.enrollmentCount}</span>
                    </div>
                  )}
                  {course.revenue !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span>{formatCurrency(course.revenue)}</span>
                    </div>
                  )}
                  {course.completionRate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completion:</span>
                      <span>{course.completionRate.toFixed(1)}%</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                    <span>Updated:</span>
                    <span>{new Date(course.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
                <Link href={`/admin/courses/${course.id}/builder`}>
                  <Button className="w-full" variant="default">
                    Edit Course
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteCourseDialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        onConfirm={confirmBulkDelete}
        courseCount={selectedCourses.size}
        courseTitle={
          selectedCourses.size === 1
            ? courses.find((c) => selectedCourses.has(c.id))?.title
            : undefined
        }
        loading={deleting}
      />
    </div>
  );
}

