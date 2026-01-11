import { Metadata } from "next";
import Link from "next/link";
import { Wrench, Stethoscope, Gavel, Home, Scissors, Truck } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CTA } from "@/components/home/CTA";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Industries We Serve | EarnYour Marketing",
  description: "Specialized digital marketing strategies for contractors, healthcare, legal, and local services in North Mississippi.",
};

const industries = [
  {
    title: "Home Services",
    description: "HVAC, Plumbing, Electrical, Roofing, and Landscaping.",
    icon: Wrench,
    slug: "home-services",
  },
  {
    title: "Healthcare",
    description: "Medical Spas, Chiropractors, Dentists, and Weight Loss Clinics.",
    icon: Stethoscope,
    slug: "healthcare",
  },
  {
    title: "Legal",
    description: "Personal Injury, Family Law, and Criminal Defense Attorneys.",
    icon: Gavel,
    slug: "legal",
  },
  {
    title: "Real Estate",
    description: "Realtors, Property Managers, and Home Inspectors.",
    icon: Home,
    slug: "real-estate",
  },
  {
    title: "Beauty & Wellness",
    description: "Salons, Barbershops, Gyms, and Yoga Studios.",
    icon: Scissors,
    slug: "beauty-wellness",
  },
  {
    title: "Logistics",
    description: "Trucking Companies, Warehousing, and Moving Services.",
    icon: Truck,
    slug: "logistics",
  },
];

export default function IndustriesPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Industries", href: "/industries" }]} />
      
      <Section className="bg-brand-navy text-white pt-20 pb-16">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Industries We Serve
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We don't use cookie-cutter templates. We build custom growth engines tailored to the unique needs of your industry.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {industries.map((industry) => (
              <Link key={industry.slug} href={`/industries/${industry.slug}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/50">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                      <industry.icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-brand-navy group-hover:text-primary transition-colors">
                      {industry.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm">
                      {industry.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <CTA />
    </>
  );
}










