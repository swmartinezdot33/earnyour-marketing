import { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Free Resources | EarnYour Marketing",
  description: "Download free guides, checklists, and templates to improve your local marketing.",
};

const resources = [
  {
    title: "Local SEO Checklist",
    description: "The complete 50-point checklist we use to rank clients on Google Maps.",
    type: "PDF Guide",
  },
  {
    title: "Google Ads Swipe File",
    description: "High-converting ad copy templates for service businesses.",
    type: "Template",
  },
  {
    title: "Review Generation Script",
    description: "Exact scripts to send customers to get 5-star reviews every time.",
    type: "Script",
  },
  {
    title: "Website Conversion Audit",
    description: "Self-audit tool to find why your website isn't converting.",
    type: "Tool",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-secondary text-white">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Free Resources
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Tools, templates, and guides to help you grow. No strings attached.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <Card key={resource.title} className="flex flex-col">
                <CardHeader>
                  <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">{resource.type}</div>
                  <CardTitle className="text-xl font-bold text-brand-navy">{resource.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-base">{resource.description}</CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="#">
                      <Download className="mr-2 h-4 w-4" /> Download Now
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}







