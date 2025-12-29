import { MagicLinkForm } from "@/components/auth/MagicLinkForm";
import { Logo } from "@/components/brand/Logo";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md mx-auto px-4">
      <div className="bg-card rounded-2xl shadow-lg p-8 border border-border">
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
    </div>
  );
}







