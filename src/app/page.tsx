import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Results } from "@/components/home/Results";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "EarnYour Marketing | Performance First Local Growth Partner",
  description: "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses in North Mississippi.",
  canonical: "https://earnyour.com",
});

export default function Home() {
  return (
    <>
      <AuthCallbackHandler />
      <Hero />
      <Services />
      <Results />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
