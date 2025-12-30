import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout Success | EarnYour Marketing",
  description: "Thank you for your purchase",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id;

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-bold font-heading text-brand-navy mb-4">
              Thank You for Your Purchase!
            </h1>
            <p className="text-xl text-muted-foreground">
              Your payment was successful and you now have access to your courses.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What's Next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You can now access your courses from your dashboard. If you checked out as a guest,
                we've created an account for you using your email address.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link href="/dashboard/courses">Go to My Courses</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/store">Browse More Courses</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {sessionId && (
            <p className="text-sm text-muted-foreground">
              Order ID: {sessionId}
            </p>
          )}
        </div>
      </Container>
    </Section>
  );
}

