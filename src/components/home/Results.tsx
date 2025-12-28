"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const stats = [
  { value: "$50M+", label: "Client Revenue Generated" },
  { value: "500k+", label: "Leads Delivered" },
  { value: "1,200+", label: "Page 1 Rankings" },
  { value: "35+", label: "Industries Served" },
];

export function Results() {
  return (
    <Section variant="navy" className="py-20">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold font-heading text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/80 font-medium uppercase tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}







