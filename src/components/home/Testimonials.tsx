"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const testimonials = [
  {
    quote: "EarnYour transformed our lead flow completely. We went from 5 calls a week to 5 calls a day within the first month. Their local SEO knowledge is unmatched.",
    author: "Sarah Jenkins",
    role: "Owner, Austin Dental Spa",
    rating: 5,
  },
  {
    quote: "The team actually cares about ROI. They didn't just build a website, they built a sales machine. Our conversion rate tripled after the redesign.",
    author: "Mike Ross",
    role: "Founder, Ross Construction",
    rating: 5,
  },
  {
    quote: "Finally an agency that speaks our language. No fluff, just results. The monthly reporting is transparent and they're always proactive with new ideas.",
    author: "Dr. James Wilson",
    role: "Director, Wilson Chiropractic",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <Section variant="sand">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-brand-navy">
            Trusted by Local Business Owners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-none shadow-sm h-full">
              <CardContent className="pt-8 flex flex-col h-full">
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-primary fill-current" />
                  ))}
                </div>
                <blockquote className="text-lg text-brand-navy/80 mb-6 flex-1 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <div className="font-bold text-brand-navy">{testimonial.author}</div>
                  <div className="text-sm text-brand-navy/60">{testimonial.role}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </Section>
  );
}










