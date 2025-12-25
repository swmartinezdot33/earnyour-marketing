"use client";

import { motion } from "framer-motion";
import { Search, PenTool, Rocket, BarChart } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const steps = [
  {
    number: "01",
    title: "Discovery & Strategy",
    description: "We deep dive into your business, market, and competitors to build a custom roadmap.",
    icon: Search,
  },
  {
    number: "02",
    title: "Implementation",
    description: "Our expert team builds your assets, optimizes your profiles, and sets up your campaigns.",
    icon: PenTool,
  },
  {
    number: "03",
    title: "Launch & Optimize",
    description: "We go live and aggressively monitor data, making rapid adjustments to maximize ROI.",
    icon: Rocket,
  },
  {
    number: "04",
    title: "Scale & Report",
    description: "As results come in, we double down on what works and provide transparent reporting.",
    icon: BarChart,
  },
];

export function Process() {
  return (
    <Section>
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-brand-navy">
            Our Proven Process
          </h2>
          <p className="text-lg text-muted-foreground">
            We've refined our system over hundreds of campaigns to deliver predictable, repeatable growth.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-border -z-10" />
          
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative bg-background pt-4"
            >
              <div className="w-16 h-16 rounded-full bg-secondary text-white flex items-center justify-center text-xl font-bold mb-6 mx-auto relative z-10 border-4 border-background shadow-lg">
                <step.icon className="h-8 w-8" />
              </div>
              <div className="text-center px-4">
                <div className="text-sm font-bold text-primary mb-2 tracking-wider">{step.number}</div>
                <h3 className="text-xl font-bold text-brand-navy mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}




