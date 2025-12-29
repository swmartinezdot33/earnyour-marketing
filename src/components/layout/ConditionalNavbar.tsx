"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyMobileCTA } from "./StickyMobileCTA";

export function ConditionalNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide navbar and footer for admin and dashboard routes
  const hideNavbar = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");
  
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

