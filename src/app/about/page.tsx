import { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "About Us | EarnYour Marketing",
  description: "Learn about the team behind EarnYour Marketing. Performance-first growth partners.",
};

export default function AboutPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-secondary text-white">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            About EarnYour
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We exist to help great local businesses get the attention they deserve.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold font-heading text-brand-navy mb-6">Our Mission</h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                <p>
                  Most marketing agencies are broken. They focus on vanity metrics like "impressions" and "clicks" while their clients wonder why the phone isn't ringing.
                </p>
                <p>
                  At EarnYour Marketing, we flip the script. We are <strong>performance-first</strong>. If our work doesn't generate revenue for your business, we haven't done our job.
                </p>
                <p>
                  We believe in transparency, hard work, and earning your trust every single month. That's why we don't lock you into long-term contracts.
                </p>
              </div>
            </div>
            <div className="bg-accent/30 rounded-2xl p-8 aspect-video flex items-center justify-center">
               <span className="text-brand-navy/40 font-bold text-2xl">Team Photo Placeholder</span>
            </div>
          </div>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}

