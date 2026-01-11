"use client";

import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

interface CourseBenefitsProps {
  benefits: string[];
}

export function CourseBenefits({ benefits }: CourseBenefitsProps) {
  return (
    <Section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-12 text-center">
            What You'll Get
          </h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4 items-start">
                <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-lg text-brand-navy/80">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
