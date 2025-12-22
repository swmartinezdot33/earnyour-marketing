import { LucideIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CTA } from "@/components/home/CTA";
import { ServiceAreaLinks } from "@/components/locations/ServiceAreaLinks";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

interface ServiceTemplateProps {
  title: string;
  subtitle: string;
  description: string;
  benefits: { title: string; description: string; icon?: LucideIcon }[];
  features: string[];
  process: { title: string; description: string }[];
  faqs: { question: string; answer: string }[];
  breadcrumbs?: { label: string; href: string }[];
}

export function ServiceTemplate({
  title,
  subtitle,
  description,
  benefits,
  features,
  process,
  faqs,
  breadcrumbs,
}: ServiceTemplateProps) {
  return (
    <>
      {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
      
      {/* Hero */}
      <Section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-secondary text-secondary-foreground">
        <Container>
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-white">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl">
              {subtitle}
            </p>
            <Button size="lg" className="h-14 px-8 text-lg" asChild>
              <Link href="/free-audit">Get a Free Audit</Link>
            </Button>
          </div>
        </Container>
      </Section>

      {/* Overview & Benefits */}
      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 mb-24">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-6">
                Why It Matters
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {description}
              </p>
              <ul className="space-y-4">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-lg text-brand-navy">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit, i) => (
                <Card key={i} className="border-none shadow-sm bg-accent/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl text-brand-navy">
                      {benefit.icon && <benefit.icon className="h-6 w-6 text-primary" />}
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-brand-navy/80">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Process */}
      <Section variant="sand">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-4">
              Our Process
            </h2>
            <p className="text-lg text-brand-navy/80">
              How we deliver consistent results.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {process.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-primary/10 absolute -top-8 -left-4 select-none">
                  0{i + 1}
                </div>
                <div className="relative pt-4 pl-4">
                  <h3 className="text-xl font-bold text-brand-navy mb-3">{step.title}</h3>
                  <p className="text-brand-navy/70">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-brand-navy mb-8 text-center">
              Common Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left font-semibold text-lg">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </Container>
      </Section>

      <ServiceAreaLinks />

      <CTA />
    </>
  );
}

