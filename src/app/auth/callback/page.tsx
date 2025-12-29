"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Extract token from hash fragment (Supabase sends tokens in hash)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type") || "magiclink";

      if (accessToken) {
        // Redirect to API route with token as query param
        const callbackUrl = `/api/auth/callback?access_token=${encodeURIComponent(accessToken)}&type=${type}`;
        window.location.href = callbackUrl;
        return;
      }
    }

    // No token found, redirect to login
    router.push("/login?error=invalid_token");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing login...</h1>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

