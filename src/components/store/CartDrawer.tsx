"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartButton } from "./CartButton";
import { CartItem } from "./CartItem";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { items, getTotal, clearCart, getItemCount } = useCart();
  const router = useRouter();

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
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Clear cart and redirect to Stripe checkout
        clearCart();
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
        setLoading(false);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to start checkout");
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
              <div className="flex justify-between items-center w-full">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-2xl font-bold text-brand-navy">
                  ${getTotal().toFixed(2)}
                </span>
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
                  `Checkout (${getItemCount()} item${getItemCount() !== 1 ? "s" : ""})`
                )}
              </Button>
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

