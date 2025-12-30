"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus } from "lucide-react";
import { showToast } from "@/components/ui/toast";

interface CreateStripeProductDialogProps {
  open: boolean;
  onClose: () => void;
  onProductCreated: (productId: string, priceId: string) => void;
  defaultName?: string;
  defaultPrice?: number;
  defaultDescription?: string;
}

export function CreateStripeProductDialog({
  open,
  onClose,
  onProductCreated,
  defaultName = "",
  defaultPrice = 0,
  defaultDescription = "",
}: CreateStripeProductDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: defaultName,
    description: defaultDescription,
    price: defaultPrice > 0 ? (defaultPrice / 100).toFixed(2) : "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      showToast("Name and price are required", "error");
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      showToast("Please enter a valid price", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/stripe/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          price: price,
          currency: "usd",
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to create product");
      }

      showToast("Stripe product created successfully!", "success");
      onProductCreated(result.product.id, result.product.price.id);
      onClose();
      
      // Reset form
      setFormData({
        name: defaultName,
        description: defaultDescription,
        price: defaultPrice > 0 ? (defaultPrice / 100).toFixed(2) : "",
      });
    } catch (error: any) {
      console.error("Error creating Stripe product:", error);
      showToast(error.message || "Failed to create Stripe product", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Stripe Product</DialogTitle>
          <DialogDescription>
            Create a new product in Stripe that will be linked to this course
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Total Google My Business Optimization Course"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Course description..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-price">Price (USD) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  placeholder="39.00"
                  className="pl-7"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the price in dollars (e.g., 39.00 for $39)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

