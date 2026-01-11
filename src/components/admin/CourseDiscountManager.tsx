"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { DiscountDialog } from "./DiscountDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { showToast } from "@/components/ui/toast";
import { format } from "date-fns";
import type { Discount } from "@/lib/db/schema";

interface CourseDiscountManagerProps {
  courseId: string;
  coursePrice: number;
  onDiscountUpdated?: () => void;
}

export function CourseDiscountManager({
  courseId,
  coursePrice,
  onDiscountUpdated,
}: CourseDiscountManagerProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; discountId: string | null }>({ open: false, discountId: null });

  useEffect(() => {
    fetchCourseDiscounts();
  }, [courseId]);

  async function fetchCourseDiscounts() {
    try {
      const response = await fetch(`/api/admin/discounts?course_id=${courseId}`);
      if (!response.ok) throw new Error("Failed to fetch discounts");
      const { discounts: data } = await response.json();
      setDiscounts(data || []);
    } catch (error) {
      console.error("Error fetching discounts:", error);
      showToast("Failed to load discounts", "error");
    } finally {
      setLoading(false);
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

  function handleDelete(discountId: string) {
    setDeleteConfirm({ open: true, discountId });
  }

  async function confirmDelete() {
    if (!deleteConfirm.discountId) return;

    try {
      const response = await fetch(`/api/admin/discounts/${deleteConfirm.discountId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete discount");

      showToast("Discount deleted successfully", "success");
      fetchCourseDiscounts();
      if (onDiscountUpdated) onDiscountUpdated();
    } catch (error) {
      console.error("Error deleting discount:", error);
      showToast("Failed to delete discount", "error");
    } finally {
      setDeleteConfirm({ open: false, discountId: null });
    }
  }

  function handleSave() {
    setDialogOpen(false);
    setEditingDiscount(null);
    fetchCourseDiscounts();
    if (onDiscountUpdated) onDiscountUpdated();
  }

  // Calculate the best active discount
  const activeDiscounts = discounts.filter((d) => {
    if (!d.active) return false;
    const now = new Date();
    if (d.start_date && new Date(d.start_date) > now) return false;
    if (d.end_date && new Date(d.end_date) < now) return false;
    return true;
  });

  const calculateDiscount = (discount: Discount): number => {
    if (discount.discount_type === "percentage") {
      const amount = (coursePrice * discount.discount_value) / 100;
      if (discount.max_discount_amount) {
        return Math.min(amount, discount.max_discount_amount);
      }
      return amount;
    }
    return discount.discount_value;
  };

  const bestDiscount = activeDiscounts.reduce((best, current) => {
    const currentAmount = calculateDiscount(current);
    const bestAmount = best ? calculateDiscount(best) : 0;
    return currentAmount > bestAmount ? current : best;
  }, null as Discount | null);

  const discountAmount = bestDiscount ? calculateDiscount(bestDiscount) : 0;
  const finalPrice = coursePrice - discountAmount;

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading discounts...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Pricing & Discounts
              </CardTitle>
              <CardDescription>
                Manage discounts for this course. The best active discount will be applied automatically.
              </CardDescription>
            </div>
            <Button onClick={handleCreate} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Discount
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Price Display */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Base Price:</span>
              <span className="text-lg font-semibold">${coursePrice.toFixed(2)}</span>
            </div>
            {bestDiscount && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Discount ({bestDiscount.name}):
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-medium">Final Price:</span>
                    <span className="text-2xl font-bold text-brand-navy">
                      ${finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </>
            )}
            {!bestDiscount && (
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">Final Price:</span>
                  <span className="text-2xl font-bold text-brand-navy">
                    ${coursePrice.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Discounts List */}
          {discounts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No discounts for this course</p>
              <p className="text-sm">Create a discount to offer special pricing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {discounts.map((discount) => {
                const isActive = activeDiscounts.some((d) => d.id === discount.id);
                const discountAmt = calculateDiscount(discount);
                const priceWithDiscount = coursePrice - discountAmt;

                return (
                  <div
                    key={discount.id}
                    className={`p-4 border rounded-lg ${
                      isActive ? "bg-green-50 border-green-200" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{discount.name}</span>
                          {isActive ? (
                            <Badge variant="default" className="bg-green-600">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {discount.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {discount.description}
                          </p>
                        )}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Discount: </span>
                            <span className="font-medium">
                              {discount.discount_type === "percentage"
                                ? `${discount.discount_value}%`
                                : `$${discount.discount_value.toFixed(2)}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Final Price: </span>
                            <span className="font-bold text-brand-navy">
                              ${priceWithDiscount.toFixed(2)}
                            </span>
                          </div>
                          {(discount.start_date || discount.end_date) && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Valid: </span>
                              <span className="text-xs">
                                {discount.start_date
                                  ? format(new Date(discount.start_date), "MMM d, yyyy")
                                  : "No start"}
                                {" - "}
                                {discount.end_date
                                  ? format(new Date(discount.end_date), "MMM d, yyyy")
                                  : "No end"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
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
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <DiscountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        discount={editingDiscount}
        onSave={handleSave}
        defaultCourseId={courseId}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Delete Discount"
        description="Are you sure you want to delete this discount? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </>
  );
}

