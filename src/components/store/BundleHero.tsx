"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { ShoppingCart, Package } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import type { CourseBundle } from "@/lib/db/schema";

interface BundleHeroProps {
  bundle: CourseBundle;
  savings: {
    totalIndividualPrice: number;
    bundlePrice: number;
    savings: number;
    savingsPercentage: number;
  };
}

export function BundleHero({ bundle, savings }: BundleHeroProps) {
  const { addToCart, isInCart } = useCart();
  const inCart = isInCart("bundle", bundle.id);

  return (
    <Section className="bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white pt-24 pb-16">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground">
                <Package className="h-3 w-3 mr-1" />
                Bundle
              </Badge>
              {bundle.featured && (
                <Badge className="bg-primary text-primary-foreground">
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              {bundle.name}
            </h1>
            <p className="text-xl text-white/80 mb-6">
              {bundle.short_description || bundle.description}
            </p>
            
            {savings.savings > 0 && (
              <div className="bg-white/10 rounded-lg p-4 mb-6">
                <p className="text-sm text-white/80 mb-1">
                  Individual Price: <span className="line-through">${savings.totalIndividualPrice.toFixed(2)}</span>
                </p>
                <p className="text-2xl font-bold text-white mb-1">
                  Save ${savings.savings.toFixed(2)} ({savings.savingsPercentage}% off)
                </p>
                <p className="text-lg text-white/80">
                  Bundle Price: <span className="text-3xl font-bold">${bundle.price}</span>
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => addToCart("bundle", bundle.id, bundle.name, bundle.price, bundle.image_url)}
                size="lg"
                disabled={inCart}
                className="bg-primary hover:bg-primary/90"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {inCart ? "In Cart" : `Add to Cart - $${bundle.price}`}
              </Button>
            </div>
          </div>
          {bundle.image_url && (
            <div className="aspect-video rounded-xl overflow-hidden shadow-2xl">
              <img
                src={bundle.image_url}
                alt={bundle.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}

