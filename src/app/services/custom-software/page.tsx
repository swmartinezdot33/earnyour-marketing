import { Metadata } from "next";
import { ServiceTemplate } from "@/components/services/ServiceTemplate";
import { Code, Layout, Server, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Custom Software Development | EarnYour Marketing",
  description: "Bespoke web apps, portals, and dashboards to solve unique business problems.",
};

export default function CustomSoftwarePage() {
  return (
    <ServiceTemplate
      title="Custom Software Development"
      subtitle="Solving unique business problems with tailored web applications and portals."
      description="Sometimes off-the-shelf software isn't enough. We build custom web applications, client portals, and internal tools that fit your business perfectly. Whether you need a customer dashboard, an inventory system, or a specialized booking tool, we can build it."
      features={[
        "Custom Web Applications",
        "Client Portals",
        "Internal Dashboards",
        "SaaS MVP Development",
        "Legacy System Modernization",
        "Cloud Infrastructure",
      ]}
      benefits={[
        {
          title: "Perfect Fit",
          description: "Software built exactly for your workflows, not the other way around.",
          icon: Layout,
        },
        {
          title: "Scalable Architecture",
          description: "Built to grow with your business using modern tech stacks.",
          icon: Server,
        },
        {
          title: "Competitive Advantage",
          description: "Own your technology and differentiate yourself from competitors.",
          icon: Code,
        },
        {
          title: "Secure & Reliable",
          description: "Enterprise-grade security and reliability standards.",
          icon: Shield,
        },
      ]}
      process={[
        {
          title: "Scoping & Specs",
          description: "We define exactly what needs to be built and create technical specifications.",
        },
        {
          title: "Agile Development",
          description: "We build in sprints, giving you regular updates and demos.",
        },
        {
          title: "QA & Deployment",
          description: "Rigorous testing before deploying to production.",
        },
      ]}
      faqs={[
        {
          question: "What technologies do you use?",
          answer: "We primarily use Next.js, React, Node.js, Python, and SQL/NoSQL databases.",
        },
        {
          question: "How much does custom software cost?",
          answer: "It varies widely based on complexity. We provide detailed estimates after scoping.",
        },
        {
          question: "Do I own the code?",
          answer: "Yes. Once paid for, you own the intellectual property.",
        },
      ]}
    />
  );
}




