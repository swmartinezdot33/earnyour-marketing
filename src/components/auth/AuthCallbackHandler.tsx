"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function AuthCallbackHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // Only handle auth callbacks on the homepage
    if (pathname !== "/") return;

    // Check for hash fragment with access_token (Supabase magic link)
    if (typeof window !== "undefined" && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const type = hashParams.get("type") || "magiclink";

      if (accessToken) {
        // Redirect to callback page
        const callbackUrl = `/auth/callback#access_token=${encodeURIComponent(accessToken)}&type=${type}`;
        window.location.href = callbackUrl;
      }
    }
  }, [pathname]);

  return null;
}

