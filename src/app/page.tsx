import { Hero } from "@/components/home/Hero";
import { Services } from "@/components/home/Services";
import { Results } from "@/components/home/Results";
import { Process } from "@/components/home/Process";
import { Testimonials } from "@/components/home/Testimonials";
import { FAQ } from "@/components/home/FAQ";
import { CTA } from "@/components/home/CTA";

export default function Home() {
  return (
    <>
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
