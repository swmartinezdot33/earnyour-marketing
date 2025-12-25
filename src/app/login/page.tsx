import { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { Logo } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "Login | EarnYour Marketing",
  description: "Sign in to access your courses and dashboard.",
};

export default function LoginPage() {
  return (
    <Section className="min-h-screen flex items-center justify-center pt-24 pb-16">
      <Container className="max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <Logo className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold font-heading text-brand-navy mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Enter your email to receive a secure login link
            </p>
          </div>
          <MagicLinkForm />
        </div>
      </Container>
    </Section>
  );
}




