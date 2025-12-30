"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package } from "lucide-react";
import type { CourseBundle } from "@/lib/db/schema";
import { useCart } from "@/contexts/CartContext";

interface CourseBundleCardProps {
  bundle: CourseBundle;
}

export function CourseBundleCard({ bundle }: CourseBundleCardProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart("bundle", bundle.id);

  return (
    <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow border-2">
      {bundle.image_url && (
        <Link href={`/store/bundles/${bundle.id}`}>
          <div className="aspect-video bg-muted rounded-t-xl overflow-hidden relative">
            <img
              src={bundle.image_url}
              alt={bundle.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {bundle.featured && (
              <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                Featured
              </Badge>
            )}
            <Badge variant="secondary" className="absolute top-2 left-2">
              <Package className="h-3 w-3 mr-1" />
              Bundle
            </Badge>
          </div>
        </Link>
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">
          <Link href={`/store/bundles/${bundle.id}`} className="hover:text-primary">
            {bundle.name}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
          {bundle.short_description || bundle.description}
        </p>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-brand-navy">
              ${bundle.price}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {bundle.course_ids.length} course{bundle.course_ids.length !== 1 ? "s" : ""} included
          </p>
        </div>
        <Button
          onClick={() => addToCart("bundle", bundle.id, bundle.name, bundle.price, bundle.image_url)}
          className="w-full mt-4"
          disabled={inCart}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {inCart ? "In Cart" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}

