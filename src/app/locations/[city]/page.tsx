import { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "path";
import fs from "fs";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { MapPin, Search, BarChart3, Star } from "lucide-react";

// Read cities data
const citiesPath = path.join(process.cwd(), "data", "cities.json");
const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

interface City {
  slug: string;
  name: string;
  state: string;
  description: string;
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
    title: `Local SEO & Marketing Agency in ${city.name}, ${city.state} | EarnYour`,
    description: `Top rated digital marketing agency serving ${city.name}, ${city.state}. We help local businesses rank higher on Google Maps and drive more revenue.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: citySlug } = await params;
  const city = cities.find((c: City) => c.slug === citySlug);

  if (!city) {
    notFound();
  }

  return (
    <ServiceTemplate
      title={`Marketing Agency in ${city.name}, ${city.state}`}
      subtitle={`The performance-first growth partner for businesses in ${city.name}.`}
      description={`If you are running a business in ${city.name}, you know the competition is fierce. To stand out, you need more than just a website—you need a growth engine. We specialize in helping ${city.name} businesses dominate their local market through SEO, Google Ads, and custom automation.`}
      features={[
        `${city.name} Local SEO Strategy`,
        "Google Maps Optimization",
        "Localized Content Marketing",
        "Review Management",
        "Lead Generation Ads",
        "Competitor Analysis",
      ]}
      benefits={[
        {
          title: "Dominate Your Market",
          description: `Be the first choice for customers in ${city.name} searching for your services.`,
          icon: Search,
        },
        {
          title: "Get Found on Maps",
          description: `Rank in the top 3 map results for keywords like "near me" in ${city.name}.`,
          icon: MapPin,
        },
        {
          title: "Drive Real Revenue",
          description: "We focus on phone calls and booked appointments, not vanity metrics.",
          icon: BarChart3,
        },
        {
          title: "Local Authority",
          description: `Establish your brand as the go-to expert in the ${city.name} area.`,
          icon: Star,
        },
      ]}
      process={[
        {
          title: "Local Audit",
          description: `We analyze your current visibility in ${city.name} and identify gaps.`,
        },
        {
          title: "Implementation",
          description: "We optimize your GMB and website for local search intent.",
        },
        {
          title: "Growth & Reporting",
          description: "We track your rankings and leads, providing transparent monthly reports.",
        },
      ]}
      faqs={[
        {
          question: `Do you work with businesses in ${city.name}?`,
          answer: `Yes! We specialize in helping local service businesses in ${city.name} and surrounding areas.`,
        },
        {
          question: "How do I rank higher on Google Maps?",
          answer: "It requires a combination of an optimized profile, consistent citations, reviews, and local content. We handle all of this for you.",
        },
        {
          question: "Can I meet with you?",
          answer: "We are a digital-first agency, but we are happy to schedule a video call to discuss your goals.",
        },
      ]}
    />
  );
}

