"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyMobileCTA } from "./StickyMobileCTA";

export function ConditionalNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide navbar and footer for all backend/portal routes:
  // - Admin routes (/admin/*)
  // - Student dashboard routes (/dashboard/*)
  // - Course learning routes (/courses/*/learn/*) - authenticated student portal
  // - Login page (has its own layout)
  const hideNavbar = 
    pathname?.startsWith("/admin") || 
    pathname?.startsWith("/dashboard") ||
    pathname?.includes("/learn") ||
    pathname === "/login";
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!hideNavbar && (
        <>
          <Footer />
          <StickyMobileCTA />
        </>
      )}
    </>
  );
}

