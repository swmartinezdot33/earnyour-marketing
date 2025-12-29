import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | EarnYour Portal",
  description: "Sign in to access your portal",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {children}
    </div>
  );
}

