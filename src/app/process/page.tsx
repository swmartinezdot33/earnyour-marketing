import { Metadata } from "next";
import { CheckCircle2, ArrowRight, Lock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "The Growth Blueprint | EarnYour Marketing",
  description: "Our proven 4-step system to double your leads in 90 days. Guaranteed.",
};

const phases = [
  {
    step: "Phase 1",
    title: "The Foundation Audit",
    description: "We tear down your current online presence to find the leaks. We analyze your website speed, local rankings, and competitor ads.",
    deliverables: ["Comprehensive Video Audit", "Competitor Spy Report", "90-Day Growth Roadmap"],
    icon: Lock, // Using Lock as a placeholder for "Audit/Security" feel
  },
  {
    step: "Phase 2",
    title: "The Conversion Engine",
    description: "Traffic is useless if it doesn't convert. We build or re-build your landing pages and automations to turn visitors into booked appointments.",
    deliverables: ["High-Converting Landing Page", "Missed Call Text Back Setup", "Review Generation System"],
    icon: CheckCircle2,
  },
  {
    step: "Phase 3",
    title: "Traffic Floodgates",
    description: "Once the bucket is fixed, we turn on the hose. We launch targeted Google & Facebook ads to drive immediate, high-intent traffic.",
    deliverables: ["Google Ads Campaign Launch", "Facebook Retargeting Setup", "Local SEO Citation Building"],
    icon: ArrowRight,
  },
  {
    step: "Phase 4",
    title: "Scale & Optimize",
    description: "We don't set it and forget it. We track every dollar, cut what's not working, and double down on what brings you the highest ROI.",
    deliverables: ["Weekly Performance Reports", "A/B Split Testing", "Revenue Attribution Tracking"],
    icon: Calendar,
  },
];

export default function ProcessPage() {
  return (
    <>
      {/* Hero Section - High Pressure / High Value */}
      <Section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-brand-navy text-white text-center">
        <Container>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-block bg-primary/20 text-primary border border-primary/50 rounded-full px-4 py-1.5 text-sm font-bold tracking-wide mb-4">
              THE 90-DAY GROWTH SYSTEM
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-heading leading-tight">
              How to <span className="text-primary">Double Your Leads</span> Without Wasting Money on Ads That Don't Work
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Stop guessing. We've installed this exact system for dozens of local businesses. It works. And if it doesn't, you don't pay.
            </p>
            <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-16 px-10 text-xl font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(235,112,48,0.5)] transition-all transform hover:scale-105" asChild>
                <a href="#booking">
                  Book Your Strategy Call
                </a>
              </Button>
            </div>
            <p className="text-sm text-white/60 pt-2">
              ⚠️ Only 4 spots available for new clients this month.
            </p>
          </div>
        </Container>
      </Section>

      {/* The Problem / Agitation */}
      <Section className="bg-white">
        <Container>
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-navy">
              Most "Marketing" is a Waste of Money
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              You've probably been burned before. An agency promised you the world, locked you into a 12-month contract, and then sent you a monthly report full of "clicks" and "impressions" but zero new revenue.
            </p>
            <div className="p-6 bg-red-50 border border-red-100 rounded-xl text-left space-y-4">
              <h3 className="font-bold text-red-800 text-lg">Does this sound familiar?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl font-bold">×</span>
                  <span className="text-brand-navy/80">You have a website, but it generates zero phone calls.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl font-bold">×</span>
                  <span className="text-brand-navy/80">You tried Facebook ads, but just got "likes" instead of leads.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl font-bold">×</span>
                  <span className="text-brand-navy/80">You have no idea what your agency is actually doing all day.</span>
                </li>
              </ul>
            </div>
            <p className="text-xl font-bold text-brand-navy">
              We fix this. We don't do "clicks." We do <span className="text-primary underline decoration-wavy underline-offset-4">Revenue</span>.
            </p>
          </div>
        </Container>
      </Section>

      {/* The Solution / Steps */}
      <Section variant="sand">
        <Container>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-navy mb-6">
              The Blueprint
            </h2>
            <p className="text-lg text-brand-navy/80 max-w-2xl mx-auto">
              Our proven 4-step process to taking you from "invisible" to "market leader."
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 relative">
             {/* Connector Line (Desktop Only) */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-brand-navy/10 -translate-x-1/2" />

            {phases.map((phase, index) => (
              <div key={index} className={`relative ${index % 2 === 0 ? "md:text-right md:pr-12" : "md:col-start-2 md:pl-12"}`}>
                
                {/* Dot on Line */}
                <div className="hidden md:block absolute top-8 w-4 h-4 rounded-full bg-primary border-4 border-accent left-1/2 -translate-x-1/2 z-10" />

                <Card className="border-none shadow-md hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-4 ${index % 2 === 0 ? "md:ml-auto" : ""}`}>
                      <phase.icon className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">{phase.step}</div>
                    <h3 className="text-2xl font-bold font-heading text-brand-navy mb-4">{phase.title}</h3>
                    <p className="text-muted-foreground mb-6">{phase.description}</p>
                    <div className={`bg-muted/50 rounded-lg p-4 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <span className="text-xs font-bold text-brand-navy uppercase block mb-2">Deliverables:</span>
                      <ul className="space-y-1">
                        {phase.deliverables.map((item, i) => (
                          <li key={i} className="text-sm text-brand-navy/80 flex items-center gap-2 justify-start md:justify-inherit">
                             <CheckCircle2 className="h-3 w-3 text-primary md:hidden" />
                             {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* The Guarantee */}
      <Section className="bg-brand-navy text-white">
        <Container>
          <div className="max-w-4xl mx-auto border-2 border-primary/30 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -right-12 -top-12 opacity-10 rotate-12">
               <Lock className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold font-heading">
                The "Zero Risk" Guarantee
              </h2>
              <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                We are so confident in our system that we offer a simple promise: <br/><br/>
                <span className="font-bold text-white bg-primary/20 px-2 py-1 rounded">
                  If we don't increase your leads in the first 90 days, we work for FREE until we do.
                </span>
              </p>
              <p className="text-sm text-white/60">
                No weasel words. No fine print. Just results.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Booking Section */}
      <Section id="booking" className="py-24">
        <Container>
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold font-heading text-brand-navy mb-6">
              Let's Build Your Roadmap
            </h2>
            <p className="text-lg text-muted-foreground mb-12">
              Book a 15-minute "Growth Audit" call. We'll look at your current setup and tell you exactly what needs to be fixed. No sales pitch, just value.
            </p>
            
            <div className="w-full h-[700px] border rounded-xl overflow-hidden shadow-2xl bg-white">
              {/* Calendly Inline Widget Placeholder */}
              {/* In a real app, you'd use react-calendly or an iframe */}
              <iframe
                src="https://calendly.com/stevenmartinez333/30min" // Replace with actual Env var or prop
                width="100%"
                height="100%"
                frameBorder="0"
                title="Select a Date & Time - Calendly"
              ></iframe>
            </div>

            <div className="mt-12 space-y-4">
              <p className="text-sm font-bold text-brand-navy uppercase tracking-wide">
                Trusted by Local Businesses In
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-muted-foreground font-heading font-bold text-xl opacity-50">
                <span>SOUTHAVEN</span>
                <span>•</span>
                <span>TUPELO</span>
                <span>•</span>
                <span>OXFORD</span>
                <span>•</span>
                <span>MEMPHIS</span>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
