"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check for hash fragment (Supabase client-side auth)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type");

      if (accessToken) {
        // Redirect to server route with token as query param
        const callbackUrl = `/api/auth/callback?access_token=${encodeURIComponent(accessToken)}&type=${type || "magiclink"}`;
        window.location.href = callbackUrl;
        return;
      }
    }

    // Check for query params (server-side auth)
    const token = searchParams.get("token") || searchParams.get("access_token");
    const type = searchParams.get("type");

    if (token) {
      // Already have token in query, let server handle it
      // The server route will process this
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

