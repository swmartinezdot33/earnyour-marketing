import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Membership Status | EarnYour Marketing",
  description: "View your membership status and course access",
};

export default async function MembershipPage() {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const user = await getUserById(session.userId);

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Membership Status
          </h1>
          <p className="text-muted-foreground">
            View your enrolled courses and account details
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription>
              Logged in as {user?.email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Manage your course progress and settings from the dashboard.
              </p>
              <Link href="/dashboard">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}

