import { Metadata } from "next";
import { Process } from "@/components/home/Process";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Our Process | EarnYour Marketing",
  description: "How we deliver consistent results for local businesses.",
};

export default function ProcessPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-brand-navy mb-6">
            The Growth Blueprint
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A proven system that eliminates guesswork and delivers predictable revenue.
          </p>
        </Container>
      </Section>

      <Process />
      
      <CTA />
    </>
  );
}

