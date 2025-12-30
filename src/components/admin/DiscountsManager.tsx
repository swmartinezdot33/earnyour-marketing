"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";
import { DiscountDialog } from "./DiscountDialog";
import type { Discount } from "@/lib/db/schema";
import { format } from "date-fns";
import { showToast } from "@/components/ui/toast";
import Link from "next/link";

export function DiscountsManager() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [courses, setCourses] = useState<Map<string, { title: string; price: number }>>(new Map());

  useEffect(() => {
    fetchDiscounts();
  }, []);

  async function fetchDiscounts() {
    try {
      const response = await fetch("/api/admin/discounts");
      if (!response.ok) throw new Error("Failed to fetch discounts");
      const { discounts: data } = await response.json();
      setDiscounts(data);

      // Fetch course info for discounts linked to courses
      const courseIds = data
        .filter((d: Discount) => d.course_id)
        .map((d: Discount) => d.course_id);
      
      if (courseIds.length > 0) {
        const coursesResponse = await fetch("/api/admin/courses");
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          const coursesMap = new Map();
          coursesData.forEach((course: any) => {
            if (courseIds.includes(course.id)) {
              coursesMap.set(course.id, { title: course.title, price: course.price });
            }
          });
          setCourses(coursesMap);
        }
      }
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(discountId: string) {
    if (!confirm("Are you sure you want to delete this discount?")) return;

    try {
      const response = await fetch(`/api/admin/discounts/${discountId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete discount");

      showToast("Discount deleted successfully", "success");
      fetchDiscounts();
    } catch (error) {
      console.error("Error deleting discount:", error);
      showToast("Failed to delete discount", "error");
    }
  }

  function handleCreate() {
    setEditingDiscount(null);
    setDialogOpen(true);
  }

  function handleEdit(discount: Discount) {
    setEditingDiscount(discount);
    setDialogOpen(true);
  }

  function handleSave() {
    setDialogOpen(false);
    setEditingDiscount(null);
    fetchDiscounts();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Discounts</h2>
          <p className="text-sm text-muted-foreground">
            Manage automatic discounts for courses and bundles
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Discount
        </Button>
      </div>

      {discounts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No discounts created yet</p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Discount
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {discounts.map((discount) => (
            <Card key={discount.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {discount.name}
                      {discount.active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    {discount.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {discount.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(discount)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(discount.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {discount.course_id && courses.has(discount.course_id) && (
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Course</p>
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/admin/courses/${discount.course_id}/builder`}
                        className="font-medium hover:text-primary"
                      >
                        {courses.get(discount.course_id)?.title}
                      </Link>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Base Price: </span>
                        <span className="font-semibold">
                          ${courses.get(discount.course_id)?.price.toFixed(2)}
                        </span>
                        {" → "}
                        <span className="font-bold text-brand-navy">
                          $
                          {(
                            courses.get(discount.course_id)!.price -
                            (discount.discount_type === "percentage"
                              ? (courses.get(discount.course_id)!.price *
                                  discount.discount_value) /
                                100
                              : discount.discount_value)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium">
                      {discount.discount_type === "percentage"
                        ? `${discount.discount_value}%`
                        : `$${discount.discount_value}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applicable To</p>
                    <p className="font-medium capitalize">{discount.applicable_to}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">
                      {discount.usage_count}
                      {discount.usage_limit ? ` / ${discount.usage_limit}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dates</p>
                    <p className="font-medium text-xs">
                      {discount.start_date
                        ? format(new Date(discount.start_date), "MMM d, yyyy")
                        : "No start"}
                      {" - "}
                      {discount.end_date
                        ? format(new Date(discount.end_date), "MMM d, yyyy")
                        : "No end"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DiscountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        discount={editingDiscount}
        onSave={handleSave}
      />
    </div>
  );
}

