import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Database, Mail, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "CRM & Marketing Automation | EarnYour Marketing",
  description: "Automate your follow-up and close more deals with GoHighLevel and custom automations.",
};

export default function CRMPage() {
  return (
    <ServiceTemplate
      title="CRM & Automations"
      subtitle="Stop letting leads slip through the cracks. Automate your follow-up and close more deals."
      description="Generating leads is only half the battle. You need to close them. Our CRM and automation solutions ensure that every lead gets followed up with instantly, nurtured automatically, and tracked until they become a paying customer."
      features={[
        "GoHighLevel (GHL) Setup",
        "Instant SMS/Email Responses",
        "Appointment Booking Automations",
        "Pipeline Management",
        "Review Request Campaigns",
        "Missed Call Text Back",
      ]}
      benefits={[
        {
          title: "Speed to Lead",
          description: "Contact leads within seconds, increasing conversion rates by up to 300%.",
          icon: Clock,
        },
        {
          title: "Nurture on Autopilot",
          description: "Keep prospects engaged with automated email and SMS sequences.",
          icon: Mail,
        },
        {
          title: "Unified Communication",
          description: "Manage emails, texts, and DMs in one single inbox.",
          icon: MessageSquare,
        },
        {
          title: "Data Centralization",
          description: "Keep all your customer data organized in one secure place.",
          icon: Database,
        },
      ]}
      process={[
        {
          title: "Workflow Mapping",
          description: "We map out your sales process from lead to close.",
        },
        {
          title: "Build & Integrate",
          description: "We set up the CRM, build the automations, and integrate your lead sources.",
        },
        {
          title: "Training & Handoff",
          description: "We train your team on how to use the system effectively.",
        },
      ]}
      faqs={[
        {
          question: "Which CRM do you use?",
          answer: "We specialize in GoHighLevel, but we can work with HubSpot, Salesforce, and others.",
        },
        {
          question: "Can I keep my current phone number?",
          answer: "Yes, we can port your number or set up a forwarding number.",
        },
        {
          question: "Is it hard to learn?",
          answer: "We provide full training and simplified dashboards so it's easy for anyone to use.",
        },
      ]}
    />
  );
}







