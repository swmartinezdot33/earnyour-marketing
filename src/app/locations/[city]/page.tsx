import { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import Link from "next/link";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { MapPin, Search, BarChart3, Star, ArrowRight } from "lucide-react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { constructServiceAreaSchema } from "@/lib/seo";

// Read cities data
const citiesPath = path.join(process.cwd(), "data", "cities.json");
const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

interface City {
  slug: string;
  name: string;
  state: string;
  description: string;
  keywords?: string[];
}

export async function generateStaticParams() {
  return cities.map((city: City) => ({
    city: city.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = cities.find((c: City) => c.slug === citySlug);

  if (!city) {
    return {};
  }

  return {
    title: `Digital Marketing Agency in ${city.name}, ${city.state} | EarnYour`,
    description: `Top rated SEO and digital marketing agency serving ${city.name}, ${city.state}. We help North Mississippi businesses rank #1 on Google and grow revenue.`,
    keywords: [`${city.name} marketing agency`, `SEO ${city.name}`, `advertising ${city.name}`, ...city.keywords || []],
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = cities.find((c: City) => c.slug === citySlug);

  if (!city) {
    notFound();
  }

  // Get other cities for internal linking
  const otherCities = cities.filter((c: City) => c.slug !== city.slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(constructServiceAreaSchema(city)),
        }}
      />
      <ServiceTemplate
        breadcrumbs={[
          { label: "Locations", href: "/locations" },
          { label: city.name, href: `/locations/${city.slug}` },
        ]}
        title={`Digital Marketing in ${city.name}, ${city.state}`}
        subtitle={`The premier growth partner for businesses in ${city.name} and the surrounding North Mississippi area.`}
        description={`If you're running a business in ${city.name}, you know that word-of-mouth isn't enough anymore. To dominate the ${city.name} market, you need a digital engine that captures customers exactly when they're searching. We specialize in helping ${city.name} companies—from contractors to clinics—scale their revenue through hyper-local SEO and high-intent advertising.`}
        features={[
          `${city.name} Local SEO Dominance`,
          "Google Maps Optimization",
          "Targeted Lead Gen Ads",
          "Review & Reputation Management",
          "Custom Website Design",
          "Competitor Analysis",
        ]}
        benefits={[
          {
            title: "Own Your Backyard",
            description: `Be the undeniable market leader in ${city.name} when customers search for your services.`,
            icon: MapPin,
          },
          {
            title: "Get Found First",
            description: `Rank in the coveted top 3 Google Map results for "${city.name}" keywords.`,
            icon: Search,
          },
          {
            title: "Real ROI",
            description: "We focus on phone calls, form fills, and revenue. No vanity metrics.",
            icon: BarChart3,
          },
          {
            title: "Local Trust",
            description: `Build a 5-star reputation that makes you the easy choice in ${city.name}.`,
            icon: Star,
          },
        ]}
        process={[
          {
            title: "Local Market Audit",
            description: `We analyze the ${city.name} competitive landscape to find your biggest opportunities.`,
          },
          {
            title: "Strategic Implementation",
            description: "We build your local authority with optimized profiles, citations, and content.",
          },
          {
            title: "Domination & Scale",
            description: "We track your rankings in specific ${city.name} zip codes and expand your reach.",
          },
        ]}
        faqs={[
          {
            question: `Why choose an agency that knows ${city.name}?`,
            answer: `Marketing in North Mississippi is different. We understand the local culture and how to connect with customers in ${city.name} effectively.`,
          },
          {
            question: "How long to rank in the Map Pack?",
            answer: "For most local niches, we see significant movement in 60-90 days, getting you more calls quickly.",
          },
          {
            question: "Do you work with other businesses in my area?",
            answer: "We typically only work with one business per industry in a specific city to avoid conflicts of interest.",
          },
        ]}
      />

      {/* Nearby Locations Section for Internal Linking */}
      <Section variant="navy" className="py-16">
        <Container>
           <h3 className="text-2xl font-bold font-heading text-white mb-8 text-center">
             We Also Serve Nearby Areas
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {otherCities.map((other: City) => (
               <Link key={other.slug} href={`/locations/${other.slug}`} className="block group">
                 <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                   <CardHeader>
                     <div className="flex items-center justify-between text-white">
                        <CardTitle className="text-lg">{other.name}, {other.state}</CardTitle>
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                     </div>
                   </CardHeader>
                 </Card>
               </Link>
             ))}
           </div>
           <div className="text-center mt-8">
              <Link href="/locations" className="text-primary hover:text-white transition-colors text-sm font-bold">
                View All Service Areas
              </Link>
           </div>
        </Container>
      </Section>
    </>
  );
}
