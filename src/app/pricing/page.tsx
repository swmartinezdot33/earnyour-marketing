import { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing | EarnYour Marketing",
  description: "Transparent pricing for local business marketing. No hidden fees, just results.",
};

const tiers = [
  {
    name: "Starter",
    price: "$1,500",
    description: "Perfect for establishing a strong local presence.",
    features: ["Local SEO Foundation", "Google Business Profile Optimization", "Monthly Content (1 Post)", "Review Management", "Monthly Reporting"],
  },
  {
    name: "Growth",
    price: "$3,000",
    description: "Accelerate leads with Ads and advanced SEO.",
    features: ["Everything in Starter", "Google Ads Management", "Advanced Local SEO", "2 Blog Posts/Month", "Call Tracking & Recording", "Bi-Weekly Strategy Calls"],
    popular: true,
  },
  {
    name: "Scale",
    price: "$5,000",
    description: "Full-service dominance for aggressive growth.",
    features: ["Everything in Growth", "Facebook & Instagram Ads", "CRM & Automation Setup", "Landing Page Optimization", "Weekly Strategy Calls", "Priority Support"],
  },
];

export default function PricingPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Invest in growth, not busy work. Choose the plan that fits your goals.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <Card key={tier.name} className={`flex flex-col relative ${tier.popular ? 'border-primary shadow-lg scale-105' : 'border-border'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-brand-navy">{tier.name}</CardTitle>
                  <div className="mt-4 flex items-baseline text-brand-navy">
                    <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                    <span className="text-muted-foreground ml-1">/month</span>
                  </div>
                  <CardDescription className="mt-2">{tier.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm text-brand-navy/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className={`w-full ${tier.popular ? 'bg-primary' : ''}`} variant={tier.popular ? "default" : "outline"} asChild>
                    <Link href="/free-audit">Get Started</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="mt-16 p-8 bg-secondary rounded-2xl text-center text-white">
            <h3 className="text-2xl font-bold font-heading mb-4">Need a Custom Solution?</h3>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              We build custom packages for multi-location businesses, franchises, and enterprise needs.
            </p>
            <Button variant="secondary" className="bg-white text-secondary hover:bg-white/90" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}

