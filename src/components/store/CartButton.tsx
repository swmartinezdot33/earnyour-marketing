"use client";

import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CartButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function CartButton({ onClick, className, variant = "outline" }: CartButtonProps) {
  const { getItemCount } = useCart();
  const count = getItemCount();

  return (
    <Button
      variant={variant}
      size="icon"
      onClick={onClick}
      className={cn("relative", className)}
      aria-label={`Shopping cart with ${count} items`}
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <Badge
          variant="destructive"
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {count > 9 ? "9+" : count}
        </Badge>
      )}
    </Button>
  );
}

