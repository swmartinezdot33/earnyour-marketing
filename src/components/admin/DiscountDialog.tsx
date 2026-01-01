"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Discount } from "@/lib/db/schema";
import { showToast } from "@/components/ui/toast";

interface DiscountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  discount: Discount | null;
  onSave: () => void;
  defaultCourseId?: string;
}

export function DiscountDialog({
  open,
  onOpenChange,
  discount,
  onSave,
  defaultCourseId,
}: DiscountDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed_amount",
    discount_value: 0,
    applicable_to: "all" as "course" | "bundle" | "all",
    course_id: "",
    bundle_id: "",
    min_purchase_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    active: true,
    usage_limit: "",
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        name: discount.name,
        description: discount.description || "",
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        applicable_to: discount.applicable_to,
        course_id: discount.course_id || "",
        bundle_id: discount.bundle_id || "",
        min_purchase_amount: discount.min_purchase_amount?.toString() || "",
        max_discount_amount: discount.max_discount_amount?.toString() || "",
        start_date: discount.start_date
          ? new Date(discount.start_date).toISOString().split("T")[0]
          : "",
        end_date: discount.end_date
          ? new Date(discount.end_date).toISOString().split("T")[0]
          : "",
        active: discount.active,
        usage_limit: discount.usage_limit?.toString() || "",
      });
    } else {
      setFormData({
        name: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        applicable_to: defaultCourseId ? "course" : "all",
        course_id: defaultCourseId || "",
        bundle_id: "",
        min_purchase_amount: "",
        max_discount_amount: "",
        start_date: "",
        end_date: "",
        active: true,
        usage_limit: "",
      });
    }
  }, [discount, open, defaultCourseId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        discount_value: parseFloat(formData.discount_value.toString()),
        course_id: formData.course_id || null,
        bundle_id: formData.bundle_id || null,
        min_purchase_amount: formData.min_purchase_amount
          ? parseFloat(formData.min_purchase_amount)
          : null,
        max_discount_amount: formData.max_discount_amount
          ? parseFloat(formData.max_discount_amount)
          : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      };

      const url = discount
        ? `/api/admin/discounts/${discount.id}`
        : "/api/admin/discounts";
      const method = discount ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to save discount");
      }

      showToast(
        discount ? "Discount updated successfully" : "Discount created successfully",
        "success"
      );
      onSave();
    } catch (error: any) {
      showToast(error.message || "Failed to save discount", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {discount ? "Edit Discount" : "Create Discount"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discount_type">Discount Type *</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(value: "percentage" | "fixed_amount") =>
                  setFormData({ ...formData, discount_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="discount_value">
                Discount Value *{" "}
                {formData.discount_type === "percentage" ? "(%)" : "($)"}
              </Label>
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min="0"
                value={formData.discount_value}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount_value: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="applicable_to">Applicable To *</Label>
            <Select
              value={formData.applicable_to}
              onValueChange={(value: "course" | "bundle" | "all") =>
                setFormData({ ...formData, applicable_to: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="course">Specific Course</SelectItem>
                <SelectItem value="bundle">Specific Bundle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.applicable_to === "course" && (
            <div>
              <Label htmlFor="course_id">Course ID</Label>
              <Input
                id="course_id"
                value={formData.course_id}
                onChange={(e) =>
                  setFormData({ ...formData, course_id: e.target.value })
                }
                placeholder="UUID of the course"
              />
            </div>
          )}

          {formData.applicable_to === "bundle" && (
            <div>
              <Label htmlFor="bundle_id">Bundle ID</Label>
              <Input
                id="bundle_id"
                value={formData.bundle_id}
                onChange={(e) =>
                  setFormData({ ...formData, bundle_id: e.target.value })
                }
                placeholder="UUID of the bundle"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_purchase_amount">Min Purchase Amount ($)</Label>
              <Input
                id="min_purchase_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_purchase_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_purchase_amount: e.target.value })
                }
              />
            </div>

            {formData.discount_type === "percentage" && (
              <div>
                <Label htmlFor="max_discount_amount">Max Discount Amount ($)</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_discount_amount: e.target.value })
                  }
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usage_limit">Usage Limit</Label>
              <Input
                id="usage_limit"
                type="number"
                min="1"
                value={formData.usage_limit}
                onChange={(e) =>
                  setFormData({ ...formData, usage_limit: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : discount ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

