import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import { MapPin, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Service Areas | Digital Marketing in North Mississippi",
  description: "We serve businesses across North Mississippi, including Southaven, Olive Branch, Tupelo, and Oxford. Find your local growth partner.",
};

const citiesPath = path.join(process.cwd(), "data", "cities.json");
const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

export default function LocationsHubPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Locations", href: "/locations" }]} />
      <Section className="bg-brand-navy text-white pt-24 pb-16 md:pt-32 md:pb-24">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Serving North Mississippi
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            From the Delta to the Hills, we help Mississippi businesses dominate their local markets with data-driven SEO and advertising.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city: any) => (
              <Link key={city.slug} href={`/locations/${city.slug}`} className="group block h-full">
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50 hover:border-primary/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <MapPin className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 duration-300" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-brand-navy mt-4 group-hover:text-primary transition-colors">
                      {city.name}, {city.state}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {city.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {city.keywords?.map((keyword: string) => (
                        <span key={keyword} className="text-xs bg-secondary/5 text-secondary px-2 py-1 rounded-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      <Section variant="sand">
        <Container className="text-center max-w-4xl">
          <h2 className="text-3xl font-bold font-heading text-brand-navy mb-6">
            Why Local Matters
          </h2>
          <p className="text-lg text-brand-navy/80 leading-relaxed mb-8">
            Marketing in Mississippi is different. Trust is everything. You need a partner who understands the local culture, the geography, and how people in the South do business. We aren't some faceless agency in New York. We focus on building long-term authority for local businesses right here at home.
          </p>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}

