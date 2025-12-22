import { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";
import { CheckCircle2, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us | EarnYour Marketing",
  description: "We don't just sell marketing. We build local empires. Read our story.",
};

export default function AboutPage() {
  return (
    <>
      <Section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-brand-navy text-white">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            We Don't Just Sell Marketing. <br />
            <span className="text-primary">We Build Local Empires.</span>
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Born in North Mississippi, built for businesses that demand real ROI.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-7 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy">
                The "Why" Behind EarnYour
              </h2>
              <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
                <p>
                  I started EarnYour Marketing because I was tired of seeing great local businesses get ripped off by "gurus" and big agencies that promised the moon but delivered nothing but excuses.
                </p>
                <p>
                  You know the type. They lock you into a 12-month contract, charge you thousands in "setup fees," and then send you a monthly automated PDF showing "impressions" and "clicks" while your phone sits silent.
                </p>
                <p>
                  <strong>That is not marketing. That is theft.</strong>
                </p>
                <p>
                  I built EarnYour on a simple, radical philosophy: <span className="text-brand-navy font-bold">We have to earn your business every single month.</span>
                </p>
                <p>
                  That means no long-term handcuffs. No hiding behind vanity metrics. We measure our success by one thing: <strong>How much revenue did we add to your bottom line?</strong>
                </p>
                <p>
                  Whether you are an HVAC tech in Southaven, a dentist in Tupelo, or a lawyer in Oxford, we treat your business like it's our own. We fight for every ranking, every lead, and every sale.
                </p>
                <div className="pt-4">
                  <p className="font-heading font-bold text-xl text-brand-navy">Steven Martinez</p>
                  <p className="text-sm">Founder, EarnYour Marketing</p>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-5 space-y-8">
              <div className="bg-accent/20 rounded-2xl p-8 border border-accent/50">
                <h3 className="text-xl font-bold font-heading text-brand-navy mb-6">Our Core Values</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-navy block">Performance First</span>
                      <span className="text-muted-foreground text-sm">If it doesn't make money, we don't do it.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-navy block">Radical Transparency</span>
                      <span className="text-muted-foreground text-sm">You own your data. You see exactly where every dollar goes.</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-brand-navy block">Local Focus</span>
                      <span className="text-muted-foreground text-sm">We don't outsource to overseas click farms. We know the North MS market.</span>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-brand-navy text-white p-6 rounded-xl text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold font-heading">$50M+</div>
                  <div className="text-xs opacity-70">Client Revenue Generated</div>
                </div>
                <div className="bg-white border border-border p-6 rounded-xl text-center shadow-sm">
                  <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold font-heading text-brand-navy">100+</div>
                  <div className="text-xs text-muted-foreground">Local Businesses Helped</div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}
