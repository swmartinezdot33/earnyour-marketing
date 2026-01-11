"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export function CTA() {
  return (
    <Section variant="navy" className="text-center py-24 md:py-32">
      <Container>
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading text-white tracking-tight">
            Ready to Dominate Your Market?
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Stop guessing with your marketing. Get a free comprehensive audit and a clear roadmap to growth. No obligation.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Button size="lg" className="h-16 px-10 text-xl font-bold" asChild>
              <Link href="/free-audit">
                Get My Free Audit <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-white/60 pt-4">
            Limited spots available for audits each month.
          </p>
        </div>
      </Container>
    </Section>
  );
}










