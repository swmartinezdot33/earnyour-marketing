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
import type { CouponCode } from "@/lib/db/schema";
import { showToast } from "@/components/ui/toast";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: CouponCode | null;
  onSave: () => void;
}

export function CouponDialog({
  open,
  onOpenChange,
  coupon,
  onSave,
}: CouponDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage" as "percentage" | "fixed_amount",
    discount_value: 0,
    applicable_to: "cart" as "course" | "bundle" | "all" | "cart",
    course_id: "",
    bundle_id: "",
    min_cart_amount: "",
    max_discount_amount: "",
    start_date: "",
    end_date: "",
    active: true,
    usage_limit: "",
    user_limit: "",
  });

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        applicable_to: coupon.applicable_to,
        course_id: coupon.course_id || "",
        bundle_id: coupon.bundle_id || "",
        min_cart_amount: coupon.min_cart_amount?.toString() || "",
        max_discount_amount: coupon.max_discount_amount?.toString() || "",
        start_date: coupon.start_date
          ? new Date(coupon.start_date).toISOString().split("T")[0]
          : "",
        end_date: coupon.end_date
          ? new Date(coupon.end_date).toISOString().split("T")[0]
          : "",
        active: coupon.active,
        usage_limit: coupon.usage_limit?.toString() || "",
        user_limit: coupon.user_limit?.toString() || "",
      });
    } else {
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: 0,
        applicable_to: "cart",
        course_id: "",
        bundle_id: "",
        min_cart_amount: "",
        max_discount_amount: "",
        start_date: "",
        end_date: "",
        active: true,
        usage_limit: "",
        user_limit: "",
      });
    }
  }, [coupon, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: any = {
        ...formData,
        discount_value: parseFloat(formData.discount_value.toString()),
        course_id: formData.course_id || null,
        bundle_id: formData.bundle_id || null,
        min_cart_amount: formData.min_cart_amount
          ? parseFloat(formData.min_cart_amount)
          : null,
        max_discount_amount: formData.max_discount_amount
          ? parseFloat(formData.max_discount_amount)
          : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        user_limit: formData.user_limit ? parseInt(formData.user_limit) : null,
      };

      const url = coupon
        ? `/api/admin/coupons/${coupon.id}`
        : "/api/admin/coupons";
      const method = coupon ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Failed to save coupon");
      }

      showToast(
        coupon ? "Coupon updated successfully" : "Coupon created successfully",
        "success"
      );
      onSave();
    } catch (error: any) {
      showToast(error.message || "Failed to save coupon", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {coupon ? "Edit Coupon Code" : "Create Coupon Code"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="code">Coupon Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  code: e.target.value.toUpperCase().replace(/\s/g, ""),
                })
              }
              placeholder="SAVE20"
              required
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Code will be automatically converted to uppercase
            </p>
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
              onValueChange={(value: "course" | "bundle" | "all" | "cart") =>
                setFormData({ ...formData, applicable_to: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cart">Entire Cart</SelectItem>
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
              <Label htmlFor="min_cart_amount">Min Cart Amount ($)</Label>
              <Input
                id="min_cart_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.min_cart_amount}
                onChange={(e) =>
                  setFormData({ ...formData, min_cart_amount: e.target.value })
                }
                placeholder="Minimum cart total to use coupon"
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
              <Label htmlFor="usage_limit">Total Usage Limit</Label>
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

            <div>
              <Label htmlFor="user_limit">Per User Usage Limit</Label>
              <Input
                id="user_limit"
                type="number"
                min="1"
                value={formData.user_limit}
                onChange={(e) =>
                  setFormData({ ...formData, user_limit: e.target.value })
                }
                placeholder="Leave empty for unlimited"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, active: checked })
              }
            />
            <Label htmlFor="active">Active</Label>
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
              {loading ? "Saving..." : coupon ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

