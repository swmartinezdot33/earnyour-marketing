"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartButton } from "./CartButton";
import { CartItem } from "./CartItem";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Loader2, Tag, X } from "lucide-react";
import { showToast } from "@/components/ui/toast";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const { items, getTotal, clearCart, getItemCount } = useCart();
  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const cartTotal = getTotal();
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          cartTotal,
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
            price: item.price,
          })),
        }),
      });

      const data = await response.json();

      if (data.valid && data.discount) {
        setAppliedCoupon({
          code: couponCode.trim().toUpperCase(),
          discount: data.discount,
        });
        setCouponCode("");
        showToast(
          `Coupon applied! You saved $${data.discount.toFixed(2)}`,
          "success"
        );
      } else {
        showToast(
          data.error || "This coupon code is not valid",
          "error"
        );
      }
    } catch (error) {
      showToast("Failed to validate coupon code", "error");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            type: item.type,
            id: item.id,
          })),
          couponCode: appliedCoupon?.code,
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Clear cart and redirect to Stripe checkout
        clearCart();
        window.location.href = data.url;
      } else {
        showToast(data.error || "Failed to start checkout", "error");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Failed to start checkout", "error");
      setLoading(false);
    }
  };

  return (
    <>
      <CartButton onClick={() => setOpen(true)} />
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Button onClick={() => { setOpen(false); router.push("/store"); }}>
                  Browse Courses
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, index) => (
                  <CartItem key={`${item.type}-${item.id}-${index}`} item={item} />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <SheetFooter className="flex-col gap-4 border-t pt-4">
              {/* Coupon Code Section */}
              <div className="w-full space-y-2">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || validatingCoupon}
                    >
                      {validatingCoupon ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code}
                      </span>
                      <span className="text-sm text-green-600">
                        -${appliedCoupon.discount.toFixed(2)}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveCoupon}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="w-full space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${getTotal().toFixed(2)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Discount ({appliedCoupon.code}):</span>
                    <span>-${appliedCoupon.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-brand-navy">
                    ${(getTotal() - (appliedCoupon?.discount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Checkout $${(getTotal() - (appliedCoupon?.discount || 0)).toFixed(2)}`
                )}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

