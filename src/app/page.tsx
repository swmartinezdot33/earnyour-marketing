import { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Results } from "@/components/home/Results";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";
import { AuthCallbackHandler } from "@/components/auth/AuthCallbackHandler";
import { constructMetadata, constructLocalBusinessSchema } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "EarnYour Marketing | Performance First Local Growth Partner",
  description: "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses in North Mississippi.",
  canonical: "https://www.earnyour.com",
});

export default function Home() {
  const localBusinessSchema = constructLocalBusinessSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
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
