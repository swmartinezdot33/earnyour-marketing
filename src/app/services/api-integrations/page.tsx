import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Network, Zap, RefreshCw, Lock } from "lucide-react";

export const metadata: Metadata = {
  title: "API Integrations | EarnYour Marketing",
  description: "Connect your software tools and eliminate manual data entry with custom API integrations.",
};

export default function APIIntegrationsPage() {
  return (
    <ServiceTemplate
      title="API Integrations"
      subtitle="Connect your tools and eliminate manual data entry."
      description="Your business runs on multiple software tools—CRM, accounting, email, project management. If they don't talk to each other, you're wasting time on manual data entry. We build custom API integrations to make your stack work as one cohesive system."
      features={[
        "Custom API Development",
        "Third-Party Integrations",
        "Data Synchronization",
        "Webhook Handlers",
        "Legacy System Connectivity",
        "Real-Time Data Pipelines",
      ]}
      benefits={[
        {
          title: "Eliminate Manual Work",
          description: "Stop copying and pasting data between spreadsheets and software.",
          icon: RefreshCw,
        },
        {
          title: "Real-Time Data",
          description: "Ensure your data is always up-to-date across all platforms.",
          icon: Zap,
        },
        {
          title: "Connect Anything",
          description: "If it has an API, we can connect to it.",
          icon: Network,
        },
        {
          title: "Secure Transfer",
          description: "Encrypted data transmission and secure authentication handling.",
          icon: Lock,
        },
      ]}
      process={[
        {
          title: "Data Mapping",
          description: "We identify where data lives and where it needs to go.",
        },
        {
          title: "Development",
          description: "We write the middleware code to connect the endpoints.",
        },
        {
          title: "Testing & Monitoring",
          description: "We verify data integrity and set up error monitoring.",
        },
      ]}
      faqs={[
        {
          question: "Can you connect X to Y?",
          answer: "Most modern software has an API. If it does, we can connect it. Contact us to check specific tools.",
        },
        {
          question: "Is it secure?",
          answer: "Yes, we use industry-standard encryption and secure authentication methods.",
        },
        {
          question: "Do you use Zapier?",
          answer: "We can use Zapier/Make for simple tasks, but we build custom code for complex, high-volume needs.",
        },
      ]}
    />
  );
}




