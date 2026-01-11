import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserForm } from "@/components/admin/CreateUserForm";

export const metadata: Metadata = {
  title: "Admin - Create User | EarnYour Marketing",
  description: "Create a new user",
};

export default async function AdminCreateUserPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <Section className="pt-24 pb-16">
      <Container className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            Create New User
          </h1>
          <p className="text-muted-foreground">
            Create a new user account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Enter the user's email and name to create their account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>
      </Container>
    </Section>
  );
}










