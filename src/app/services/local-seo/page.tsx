import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { MapPin, Search, BarChart3, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Local SEO Services | EarnYour Marketing",
  description: "Dominate Google Maps and local search results. We help local businesses rank higher and get more calls.",
};

export default function LocalSEOPage() {
  return (
    <ServiceTemplate
      breadcrumbs={[
        { label: "Services", href: "/services" },
        { label: "Local SEO", href: "/services/local-seo" },
      ]}
      title="Dominate Your Local Market"
      subtitle="Stop losing customers to competitors. We help you rank #1 on Google Maps and Search for high-intent local keywords."
      description="Local SEO is the lifeline of any service-based business. When customers in your area need a service, they turn to Google. If you aren't in the 'Map Pack' (the top 3 results), you are invisible. We fix that by optimizing every aspect of your online presence to signal authority and relevance to Google."
      features={[
        "Google Business Profile Optimization",
        "Local Citation Building",
        "Review Generation Strategy",
        "Localized Content Creation",
        "On-Page Technical SEO",
        "Monthly Ranking Reports",
      ]}
      benefits={[
        {
          title: "Higher Visibility",
          description: "Get seen by customers exactly when they are searching for your services.",
          icon: Search,
        },
        {
          title: "More Calls & Leads",
          description: "Traffic is vanity, revenue is sanity. We focus on driving phone calls and form fills.",
          icon: BarChart3,
        },
        {
          title: "Build Trust",
          description: "A strong local presence with 5-star reviews builds instant credibility.",
          icon: Star,
        },
        {
          title: "Map Pack Dominance",
          description: "Secure your spot in the coveted top 3 map results for your main keywords.",
          icon: MapPin,
        },
      ]}
      process={[
        {
          title: "Audit & Cleanup",
          description: "We analyze your current presence, fix NAP (Name, Address, Phone) inconsistencies, and audit your competitors.",
        },
        {
          title: "Optimization & Content",
          description: "We optimize your GMB profile, website structure, and create location-specific pages.",
        },
        {
          title: "Authority Building",
          description: "We build high-quality citations and backlinks to signal trust to Google.",
        },
      ]}
      faqs={[
        {
          question: "How long does Local SEO take?",
          answer: "Typically, you can start seeing movement in 30-60 days, but significant rankings usually take 3-6 months depending on competition.",
        },
        {
          question: "Do I really need a Google Business Profile?",
          answer: "Yes. It is the single most important factor for local visibility. Without it, you cannot appear in Google Maps.",
        },
        {
          question: "What is the difference between SEO and Local SEO?",
          answer: "Local SEO focuses on ranking for geographic-specific searches (e.g., 'plumber in Austin'), whereas general SEO focuses on global ranking.",
        },
      ]}
    />
  );
}

