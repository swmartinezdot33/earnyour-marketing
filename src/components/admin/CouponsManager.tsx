"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy } from "lucide-react";
import { CouponDialog } from "./CouponDialog";
import type { CouponCode } from "@/lib/db/schema";
import { format } from "date-fns";
import { showToast } from "@/components/ui/toast";

export function CouponsManager() {
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<CouponCode | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const response = await fetch("/api/admin/coupons");
      if (!response.ok) throw new Error("Failed to fetch coupons");
      const { coupons: data } = await response.json();
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleCreate() {
    setEditingCoupon(null);
    setDialogOpen(true);
  }

  function handleEdit(coupon: CouponCode) {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  }

  function handleCopyCode(code: string) {
    navigator.clipboard.writeText(code);
    showToast("Coupon code copied to clipboard", "success");
  }

  function handleSave() {
    setDialogOpen(false);
    setEditingCoupon(null);
    fetchCoupons();
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Coupon Codes</h2>
          <p className="text-sm text-muted-foreground">
            Create coupon codes for customers to use at checkout
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          New Coupon Code
        </Button>
      </div>

      {coupons.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No coupon codes created yet</p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Coupon Code
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon) => (
            <Card key={coupon.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-muted rounded text-lg font-mono">
                        {coupon.code}
                      </code>
                      {coupon.active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </CardTitle>
                    {coupon.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {coupon.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(coupon.code)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(coupon)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Discount</p>
                    <p className="font-medium">
                      {coupon.discount_type === "percentage"
                        ? `${coupon.discount_value}%`
                        : `$${coupon.discount_value}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Applicable To</p>
                    <p className="font-medium capitalize">{coupon.applicable_to}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Usage</p>
                    <p className="font-medium">
                      {coupon.usage_count}
                      {coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / ∞"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Dates</p>
                    <p className="font-medium text-xs">
                      {coupon.start_date
                        ? format(new Date(coupon.start_date), "MMM d, yyyy")
                        : "No start"}
                      {" - "}
                      {coupon.end_date
                        ? format(new Date(coupon.end_date), "MMM d, yyyy")
                        : "No end"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CouponDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        coupon={editingCoupon}
        onSave={handleSave}
      />
    </div>
  );
}

