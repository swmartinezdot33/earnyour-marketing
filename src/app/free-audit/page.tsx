import { Metadata } from "next";
import { AuditForm } from "@/components/forms/AuditForm";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Get Your Free Marketing Audit | EarnYour Marketing",
  description: "Stop guessing. Get a comprehensive review of your SEO, Ads, and Website performance. No obligation.",
};

const benefits = [
  "Comprehensive SEO & Maps Analysis",
  "Website Speed & Conversion Review",
  "Competitor Spy Report",
  "Actionable Growth Roadmap",
];

export default function FreeAuditPage() {
  return (
    <Section className="bg-secondary min-h-screen flex items-center py-12 md:py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          <div className="text-white space-y-8 lg:sticky lg:top-32">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary font-bold text-sm mb-6 border border-primary/50">
                Limited Time Offer
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-6">
                Get Your Free Growth Audit
              </h1>
              <p className="text-xl text-white/80 leading-relaxed">
                Most agencies charge $500+ for this. We do it for free because we know that once you see the gaps in your current strategy, you'll want us to fix them.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold font-heading">What You Get:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-lg text-white/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 border-t border-white/10">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-white/10 border-2 border-secondary flex items-center justify-center text-xs font-bold">
                      {/* Placeholder avatars */}
                      User
                    </div>
                  ))}
                </div>
                <div className="text-sm text-white/70">
                  <span className="font-bold text-white">100+ Audits</span> delivered this month
                </div>
              </div>
            </div>
          </div>

          <div>
             <AuditForm />
          </div>
        </div>
      </Container>
    </Section>
  );
}







