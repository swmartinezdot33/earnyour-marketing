"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Globe, Search, Megaphone, Database, Code } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

const services = [
  {
    title: "Local SEO",
    description: "Dominate Google Maps and local search results to drive consistent organic traffic.",
    icon: MapPin,
    href: "/services/local-seo",
  },
  {
    title: "High-Converting Websites",
    description: "Custom designed, lightning fast websites built to convert visitors into leads.",
    icon: Globe,
    href: "/services/websites",
  },
  {
    title: "Google Ads",
    description: "Targeted PPC campaigns that capture high-intent customers exactly when they're searching.",
    icon: Search,
    href: "/services/google-ads",
  },
  {
    title: "Social Media Ads",
    description: "Scalable Facebook and Instagram campaigns to build brand awareness and generate leads.",
    icon: Megaphone,
    href: "/services/facebook-ads",
  },
  {
    title: "CRM & Automations",
    description: "Streamline your sales process with custom GoHighLevel setups and automated follow-ups.",
    icon: Database,
    href: "/services/crm-automations",
  },
  {
    title: "Custom Software",
    description: "Beskpoke portals, dashboards, and integrations to solve unique business problems.",
    icon: Code,
    href: "/services/custom-software",
  },
];

export function Services() {
  return (
    <Section variant="sand">
      <Container>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-heading mb-6 text-brand-navy">
            Everything You Need to Scale
          </h2>
          <p className="text-lg text-brand-navy/80">
            We don't just sell services. We build comprehensive growth engines tailored to your local business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link href={service.href} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-none shadow-sm">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                      <service.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-xl text-brand-navy group-hover:text-primary transition-colors">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {service.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

