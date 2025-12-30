import { Metadata } from "next";
import { getBundleById, getBundleWithCourses, calculateBundleSavings } from "@/lib/db/bundles";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Package, ShoppingCart, CheckCircle2 } from "lucide-react";
import { BundleHero } from "@/components/store/BundleHero";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { 
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const bundle = await getBundleById(id);
    if (!bundle || !bundle.published) {
      return { title: "Bundle Not Found" };
    }
    return {
      title: `${bundle.name} | EarnYour Marketing`,
      description: bundle.short_description || bundle.description || undefined,
    };
  } catch (error) {
    return { title: "Course Bundle | EarnYour Marketing" };
  }
}

export default async function BundlePage({ 
  params 
}: { 
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  let bundle;
  try {
    bundle = await getBundleById(id);
  } catch (error) {
    console.error("Error fetching bundle:", error);
    notFound();
  }
  
  if (!bundle || !bundle.published) {
    notFound();
  }

  const { courses } = await getBundleWithCourses(bundle.id);
  const savings = await calculateBundleSavings(bundle);

  return (
    <>
      <BundleHero bundle={bundle} savings={savings} />
      
      {bundle.description && (
        <Section>
          <Container>
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-brand-navy mb-6">
                About This Bundle
              </h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground whitespace-pre-line">
                  {bundle.description}
                </p>
              </div>
            </div>
          </Container>
        </Section>
      )}

      {courses.length > 0 && (
        <Section className="bg-muted/50">
          <Container>
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold font-heading text-brand-navy mb-8">
                Courses Included
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        {course.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {course.short_description || course.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-brand-navy">
                          ${course.price}
                        </span>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/store/${course.slug}`}>View Course</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {savings.savings > 0 && (
                <Card className="mt-8 bg-green-50 border-green-200">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Individual Price: <span className="line-through">${savings.totalIndividualPrice.toFixed(2)}</span>
                      </p>
                      <p className="text-2xl font-bold text-green-700 mb-2">
                        Save ${savings.savings.toFixed(2)} ({savings.savingsPercentage}% off)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Bundle Price: <span className="text-lg font-bold text-brand-navy">${bundle.price}</span>
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

