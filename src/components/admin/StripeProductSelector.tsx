"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, Unlink, RefreshCw, ExternalLink, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateStripeProductDialog } from "./CreateStripeProductDialog";
import { showToast } from "@/components/ui/toast";

interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  price: {
    id: string;
    unit_amount: number;
    currency: string;
  } | null;
}

interface StripeProductSelectorProps {
  courseId: string;
  currentProductId?: string | null;
  currentPriceId?: string | null;
  courseTitle?: string;
  coursePrice?: number;
  courseDescription?: string;
  onProductLinked: (productId: string, priceId: string) => void;
}

export function StripeProductSelector({
  courseId,
  currentProductId,
  currentPriceId,
  courseTitle,
  coursePrice,
  courseDescription,
  onProductLinked,
}: StripeProductSelectorProps) {
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>(currentProductId || "");
  const [linking, setLinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (currentProductId) {
      setSelectedProductId(currentProductId);
    }
  }, [currentProductId]);

  const fetchProducts = async () => {
    setFetching(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/stripe/products");
      if (!response.ok) {
        throw new Error("Failed to fetch Stripe products");
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLinkProduct = async () => {
    if (!selectedProductId) {
      setError("Please select a product");
      return;
    }

    const selectedProduct = products.find((p) => p.id === selectedProductId);
    if (!selectedProduct || !selectedProduct.price) {
      setError("Selected product does not have a price");
      return;
    }

    setLinking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/stripe/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripe_product_id: selectedProduct.id,
          stripe_price_id: selectedProduct.price.id,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Product linked successfully!");
        onProductLinked(selectedProduct.id, selectedProduct.price.id);
      } else {
        setError(data.error || "Failed to link product");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to link product");
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkProduct = async () => {
    setLinking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/stripe/unlink`, {
        method: "POST",
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Product unlinked successfully!");
        setSelectedProductId("");
        onProductLinked("", "");
      } else {
        setError(data.error || "Failed to unlink product");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to unlink product");
    } finally {
      setLinking(false);
    }
  };

  const handleProductCreated = async (productId: string, priceId: string) => {
    // Refresh products list
    await fetchProducts();
    
    // Automatically link the newly created product
    setSelectedProductId(productId);
    setLinking(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/stripe/link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stripe_product_id: productId,
          stripe_price_id: priceId,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSuccess("Product created and linked successfully!");
        onProductLinked(productId, priceId);
      } else {
        setError(data.error || "Product created but failed to link");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Product created but failed to link");
    } finally {
      setLinking(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Stripe Product</CardTitle>
            <CardDescription>
              Link this course to a Stripe product for payment processing
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProducts}
            disabled={fetching}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {currentProductId ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Currently Linked Product</Label>
                <Badge variant="default">Linked</Badge>
              </div>
              <div className="space-y-1 text-sm">
                <div>
                  <span className="text-muted-foreground">Product ID: </span>
                  <code className="text-xs font-mono">{currentProductId}</code>
                </div>
                {currentPriceId && (
                  <div>
                    <span className="text-muted-foreground">Price ID: </span>
                    <code className="text-xs font-mono">{currentPriceId}</code>
                  </div>
                )}
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://dashboard.stripe.com/products/${currentProductId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View in Stripe
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <Button
              variant="destructive"
              onClick={handleUnlinkProduct}
              disabled={linking}
              className="w-full"
            >
              {linking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Unlinking...
                </>
              ) : (
                <>
                  <Unlink className="mr-2 h-4 w-4" />
                  Unlink Product
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {fetching ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground space-y-4">
                <p className="mb-2">No Stripe products found</p>
                <p className="text-sm mb-4">
                  Create a new product for this course or create products in your Stripe Dashboard.
                </p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  variant="default"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Product
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stripe-product">Select Stripe Product</Label>
                  <Select
                    value={selectedProductId}
                    onValueChange={setSelectedProductId}
                  >
                    <SelectTrigger id="stripe-product">
                      <SelectValue placeholder="Choose a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{product.name}</span>
                            {product.price && (
                              <Badge variant="secondary" className="ml-2">
                                {formatCurrency(product.price.unit_amount, product.price.currency)}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedProductId && (
                  <div className="p-3 bg-muted rounded-md text-sm">
                    {(() => {
                      const product = products.find((p) => p.id === selectedProductId);
                      if (!product) return null;
                      return (
                        <div className="space-y-1">
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-muted-foreground text-xs">
                              {product.description}
                            </div>
                          )}
                          {product.price && (
                            <div className="text-muted-foreground">
                              Price: {formatCurrency(product.price.unit_amount, product.price.currency)}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={handleLinkProduct}
                    disabled={linking || !selectedProductId}
                    className="flex-1"
                  >
                    {linking ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Link2 className="mr-2 h-4 w-4" />
                        Link Product
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setCreateDialogOpen(true)}
                    variant="outline"
                    disabled={linking}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Create Product Dialog */}
        <CreateStripeProductDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          onProductCreated={handleProductCreated}
          defaultName={courseTitle}
          defaultPrice={coursePrice}
          defaultDescription={courseDescription}
        />
      </CardContent>
    </Card>
  );
}

