"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { constructFAQSchema } from "@/lib/seo";

const faqs = [
  {
    question: "Do you require long-term contracts?",
    answer: "No. We believe in earning your business every month. Most of our services operate on a month-to-month basis. We're confident that our results will keep you around.",
  },
  {
    question: "How long does it take to see results?",
    answer: "It depends on the service. PPC ads can generate leads within 48 hours. SEO typically takes 3-6 months to see significant momentum. We provide realistic timelines during our discovery call.",
  },
  {
    question: "Do you work with businesses outside of your local area?",
    answer: "Yes! While we focus on North Mississippi, we help local businesses across the United States. Our systems work regardless of your location.",
  },
  {
    question: "What makes you different from other agencies?",
    answer: "We are performance-first. We don't care about vanity metrics like 'impressions' or 'clicks' if they don't turn into revenue. We focus on leads, appointments, and sales.",
  },
  {
    question: "How much do your services cost?",
    answer: "We have packages starting from $1,500/mo for SEO and Ads. However, we tailor our solutions to your specific goals and budget. Book a free audit to get a custom quote.",
  },
];

export function FAQ() {
  const faqSchema = constructFAQSchema(faqs);

  return (
    <Section>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-brand-navy">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Got questions? We've got answers. If you don't see your question here, reach out to us directly.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
}

