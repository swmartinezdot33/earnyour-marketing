import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Globe, Smartphone, Zap, Layout } from "lucide-react";

export const metadata: Metadata = {
  title: "Website Design & Development | EarnYour Marketing",
  description: "Custom, high-performance websites built to convert. Next.js, React, and modern design.",
};

export default function WebsitesPage() {
  return (
    <ServiceTemplate
      title="High-Converting Websites"
      subtitle="Turn visitors into paying customers with a site that loads fast and looks premium."
      description="Your website is your 24/7 salesperson. If it's slow, outdated, or hard to navigate, you are losing money. We build custom websites using modern technology (not slow WordPress themes) that are designed to convert traffic into leads. Fast, secure, and beautiful."
      features={[
        "Custom Design (No Templates)",
        "Mobile-First Development",
        "Lightning Fast Loading Speeds",
        "SEO Optimized Architecture",
        "Conversion Rate Optimization (CRO)",
        "Secure & Scalable",
      ]}
      benefits={[
        {
          title: "Speed Matters",
          description: "We build with Next.js for sub-second load times, keeping users engaged.",
          icon: Zap,
        },
        {
          title: "Mobile Optimized",
          description: "Perfect experience on every device, from phone to desktop.",
          icon: Smartphone,
        },
        {
          title: "Built to Convert",
          description: "Strategic layouts and CTAs that guide visitors to take action.",
          icon: Layout,
        },
        {
          title: "Premium Design",
          description: "Stand out from competitors with a professional, trustworthy aesthetic.",
          icon: Globe,
        },
      ]}
      process={[
        {
          title: "Discovery & Wireframing",
          description: "We map out the user journey and site structure before writing a single line of code.",
        },
        {
          title: "Design & Development",
          description: "We design a custom look and build it using clean, modern code.",
        },
        {
          title: "Launch & Training",
          description: "We launch your site and show you how to easily make updates.",
        },
      ]}
      faqs={[
        {
          question: "Do you use WordPress?",
          answer: "We primarily build with Next.js for superior performance and security, but we can work with WordPress if required.",
        },
        {
          question: "Will my website work on mobile?",
          answer: "Absolutely. We design mobile-first to ensure a perfect experience on all devices.",
        },
        {
          question: "How long does a build take?",
          answer: "A standard local business website typically takes 4-6 weeks from discovery to launch.",
        },
      ]}
    />
  );
}







