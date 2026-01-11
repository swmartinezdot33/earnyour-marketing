"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

interface CourseFAQProps {
  courseTitle: string;
  faqs?: Array<{ question: string; answer: string }>;
}

const defaultFaqs = [
  {
    question: "Do I need any prior knowledge to take this course?",
    answer: "No prior experience is required. The course is designed for beginners and builds foundational knowledge step by step.",
  },
  {
    question: "How long does it take to complete the course?",
    answer: "It varies depending on how much time you can dedicate. Most students complete it in 2-4 weeks of consistent study, but you can learn at your own pace.",
  },
  {
    question: "Is this course really for me?",
    answer: "This course is designed for anyone wanting to master the fundamentals. Whether you're a beginner or looking to solidify your knowledge, you'll find value in the structured approach.",
  },
  {
    question: "What if I don't like the course?",
    answer: "We're confident you'll love it. If you have concerns, reach out to our support team within the first 30 days.",
  },
  {
    question: "Do I get a certificate upon completion?",
    answer: "Yes! You'll receive a certificate of completion that you can share on your professional profiles.",
  },
  {
    question: "Can I access the course on mobile?",
    answer: "Absolutely. All course materials are fully responsive and can be accessed from any device at any time.",
  },
];

export function CourseFAQ({ 
  courseTitle, 
  faqs = defaultFaqs 
}: CourseFAQProps) {
  if (faqs.length === 0) {
    return null;
  }

  return (
    <Section>
      <Container>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-base leading-relaxed">
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
