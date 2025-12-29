"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for hash fragment first (Supabase sends tokens in hash)
    if (typeof window !== "undefined" && window.location.hash) {
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

    // Check for query params (if redirected from API)
    const token = searchParams.get("access_token") || searchParams.get("token");
    if (token) {
      // Already have token, redirect to API route
      const type = searchParams.get("type") || "magiclink";
      const callbackUrl = `/api/auth/callback?access_token=${encodeURIComponent(token)}&type=${type}`;
      window.location.href = callbackUrl;
      return;
    }

    // No token found, redirect to login
    router.push("/login?error=invalid_token");
  }, [router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Completing login...</h1>
        <p className="text-muted-foreground">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}

