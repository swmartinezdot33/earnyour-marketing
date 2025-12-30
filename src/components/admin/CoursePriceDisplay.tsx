"use client";

import { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import type { Discount } from "@/lib/db/schema";

interface CoursePriceDisplayProps {
  coursePrice: number;
  courseId: string;
}

export function CoursePriceDisplay({ coursePrice, courseId }: CoursePriceDisplayProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, [courseId]);

  async function fetchDiscounts() {
    try {
      const response = await fetch(`/api/admin/discounts?course_id=${courseId}`);
      if (!response.ok) return;
      const { discounts: data } = await response.json();
      setDiscounts(data || []);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h3 className="font-semibold mb-2">Price</h3>
        <p className="text-2xl font-bold text-brand-navy">${coursePrice.toFixed(2)}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-semibold mb-2 flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Price
      </h3>
      {bestDiscount ? (
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg text-muted-foreground line-through">
              ${coursePrice.toFixed(2)}
            </span>
            <span className="text-2xl font-bold text-brand-navy">
              ${finalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-green-600 font-medium">
            {bestDiscount.discount_type === "percentage"
              ? `${bestDiscount.discount_value}% off`
              : `$${bestDiscount.discount_value.toFixed(2)} off`}
          </p>
        </div>
      ) : (
        <p className="text-2xl font-bold text-brand-navy">${coursePrice.toFixed(2)}</p>
      )}
    </div>
  );
}

