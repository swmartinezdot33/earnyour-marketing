"use client";

import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  rating: number;
}

interface CourseTestimonialsProps {
  testimonials?: Testimonial[];
}

// Default testimonials (can be overridden per course)
const defaultTestimonials: Testimonial[] = [
  {
    quote: "This course completely changed how I approach marketing. The practical strategies are immediately applicable.",
    author: "Sarah Johnson",
    role: "Business Owner",
    rating: 5,
  },
  {
    quote: "Comprehensive, well-organized, and delivered by someone who really knows the industry. Highly recommended!",
    author: "Michael Chen",
    role: "Marketing Manager",
    rating: 5,
  },
  {
    quote: "Best investment I've made in my education. The ROI has already paid for the course multiple times over.",
    author: "Jessica Martinez",
    role: "Entrepreneur",
    rating: 5,
  },
];

export function CourseTestimonials({ 
  testimonials = defaultTestimonials 
}: CourseTestimonialsProps) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <Section variant="sand">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-12 text-center">
            What Students Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-none shadow-sm h-full">
                <CardContent className="pt-8 flex flex-col h-full">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="h-5 w-5 text-primary fill-current"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg text-brand-navy/80 mb-6 flex-1 italic leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-bold text-brand-navy">
                      {testimonial.author}
                    </div>
                    <div className="text-sm text-brand-navy/60">
                      {testimonial.role}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
