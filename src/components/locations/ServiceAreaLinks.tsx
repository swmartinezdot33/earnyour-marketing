import Link from "next/link";
import fs from "fs";
import path from "path";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";

// We need to read the JSON file. In a real component, we might pass this as props
// but since we are using Server Components, we can read it here or pass it down.
// To keep it simple and reusable on pages, let's fetch it or import it.
// Importing large JSONs directly in client components is bad, but this is small.
// However, 'fs' only works on server. So this must be a server component.
// We'll read the file in the component body.

export async function ServiceAreaLinks() {
  const citiesPath = path.join(process.cwd(), "data", "cities.json");
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));

  return (
    <Section className="py-12 bg-muted/30 border-t border-border">
      <Container>
        <h3 className="text-2xl font-bold font-heading text-brand-navy mb-6 text-center">
          We Serve North Mississippi
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          {cities.map((city: any) => (
            <Link 
              key={city.slug} 
              href={`/locations/${city.slug}`}
              className="text-muted-foreground hover:text-primary transition-colors border-b border-transparent hover:border-primary"
            >
              {city.name}
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
}










