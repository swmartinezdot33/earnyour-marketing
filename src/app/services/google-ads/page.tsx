import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Search, Target, TrendingUp, DollarSign } from "lucide-react";

export const metadata: Metadata = {
  title: "Google Ads Management | EarnYour Marketing",
  description: "High-intent PPC campaigns that drive immediate leads. Certified Google Ads experts.",
};

export default function GoogleAdsPage() {
  return (
    <ServiceTemplate
      title="High-Intent Google Ads"
      subtitle="Capture customers the moment they are searching for what you offer."
      description="Google Ads is the fastest way to generate leads. We create highly targeted campaigns that put your business in front of customers exactly when they are looking for your services. No wasted spend, just high-quality leads."
      features={[
        "Keyword Research & Selection",
        "Ad Copywriting that Sells",
        "Landing Page Optimization",
        "Conversion Tracking Setup",
        "Negative Keyword Management",
        "Weekly Performance Optimization",
      ]}
      benefits={[
        {
          title: "Immediate Results",
          description: "Skip the wait. Start getting calls and leads as soon as campaigns go live.",
          icon: Zap,
        },
        {
          title: "Laser Targeting",
          description: "Target specific locations, demographics, and search intents.",
          icon: Target,
        },
        {
          title: "Maximize ROI",
          description: "We optimize for cost-per-acquisition, not just clicks.",
          icon: TrendingUp,
        },
        {
          title: "Budget Control",
          description: "You decide how much to spend. Scale up when it works.",
          icon: DollarSign,
        },
      ]}
      process={[
        {
          title: "Strategy & Setup",
          description: "We research keywords, competitors, and setup your account structure.",
        },
        {
          title: "Launch & Learn",
          description: "We go live and gather initial data to see what performs best.",
        },
        {
          title: "Optimize & Scale",
          description: "We cut wasted spend and double down on winning keywords.",
        },
      ]}
      faqs={[
        {
          question: "How much budget do I need?",
          answer: "We recommend a minimum ad spend of $1,000/month to get sufficient data and results.",
        },
        {
          question: "Do I pay Google or you?",
          answer: "You pay Google directly for ad spend. We charge a management fee for our services.",
        },
        {
          question: "How do you track results?",
          answer: "We set up tracking for phone calls, form submissions, and sales so we know exactly what's working.",
        },
      ]}
    />
  );
}

// Helper for icon
import { Zap } from "lucide-react";

