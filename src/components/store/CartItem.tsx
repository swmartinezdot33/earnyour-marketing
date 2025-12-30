"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/contexts/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeFromCart } = useCart();

  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0">
      {item.image_url && (
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {item.type === "course" ? "Course" : "Bundle"}
        </p>
        <p className="text-sm font-bold text-brand-navy mt-2">
          ${item.price}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeFromCart(item.type, item.id)}
        className="flex-shrink-0"
        aria-label="Remove from cart"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

