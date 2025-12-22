import { Metadata } from "next";
import { Services } from "@/components/home/Services";
import { CTA } from "@/components/home/CTA";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

export const metadata: Metadata = {
  title: "Services | EarnYour Marketing",
  description: "Comprehensive marketing services for local businesses. SEO, Ads, Websites, and CRM Automation.",
};

export default function ServicesPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            Our Services
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We offer a full suite of digital growth solutions designed to help local businesses scale.
          </p>
        </Container>
      </Section>
      <Services />
      <CTA />
    </>
  );
}

