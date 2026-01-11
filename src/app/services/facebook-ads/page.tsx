import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Megaphone, Users, Heart, Filter } from "lucide-react";

export const metadata: Metadata = {
  title: "Facebook & Instagram Ads | EarnYour Marketing",
  description: "Scalable social media advertising to build brand and generate leads.",
};

export default function FacebookAdsPage() {
  return (
    <ServiceTemplate
      title="Scalable Social Ads"
      subtitle="Generate demand and build brand awareness with targeted Facebook & Instagram campaigns."
      description="Social media ads allow you to reach people who might need your service but aren't actively searching yet. It's powerful for generating awareness and retargeting people who visited your site but didn't convert."
      features={[
        "Audience Segmentation",
        "Creative Design & Copy",
        "Retargeting Campaigns",
        "Lead Form Integration",
        "Pixel Setup & Tracking",
        "A/B Testing",
      ]}
      benefits={[
        {
          title: "Build Awareness",
          description: "Get your brand in front of thousands of local people.",
          icon: Megaphone,
        },
        {
          title: "Precise Targeting",
          description: "Target by interests, behaviors, and demographics.",
          icon: Filter,
        },
        {
          title: "Retargeting",
          description: "Bring back visitors who left your site without buying.",
          icon: Users,
        },
        {
          title: "Brand Loyalty",
          description: "Stay top-of-mind with consistent, engaging content.",
          icon: Heart,
        },
      ]}
      process={[
        {
          title: "Audience Research",
          description: "We identify your ideal customer profile and build audiences to match.",
        },
        {
          title: "Creative Development",
          description: "We design eye-catching images and videos that stop the scroll.",
        },
        {
          title: "Launch & Testing",
          description: "We test multiple variations to find the winning combination.",
        },
      ]}
      faqs={[
        {
          question: "Is Facebook Ads right for my business?",
          answer: "It works great for visual services (home remodeling, medical aesthetics) and lead generation.",
        },
        {
          question: "What about Instagram?",
          answer: "Yes, we manage ads across both Facebook and Instagram from a single platform.",
        },
        {
          question: "Do I need to post content daily?",
          answer: "No. Ads are separate from organic posting. You don't need a big following to run ads.",
        },
      ]}
    />
  );
}










