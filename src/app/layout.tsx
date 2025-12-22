import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { constructLocalBusinessSchema } from "@/lib/seo";

// Fallback fonts from Google
const oswald = Oswald({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Local fonts setup (commented out until files are present)
/*
const bernhard = localFont({
  src: [
    {
      path: '../../public/fonts/BernhardGothic-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    // Add other weights
  ],
  variable: '--font-heading',
  display: 'swap',
});

const garet = localFont({
  src: [
    {
      path: '../../public/fonts/Garet-Book.woff2',
      weight: '400',
      style: 'normal',
    },
    // Add other weights
  ],
  variable: '--font-body',
  display: 'swap',
});
*/

export const metadata: Metadata = {
  title: {
    default: "EarnYour Marketing | Performance First Local Growth Partner",
    template: "%s | EarnYour Marketing",
  },
  description: "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses.",
  metadataBase: new URL("https://earnyour.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://earnyour.com",
    title: "EarnYour Marketing",
    description: "Performance first local growth partner.",
    siteName: "EarnYour Marketing",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          oswald.variable,
          inter.variable
        )}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(constructLocalBusinessSchema()),
          }}
        />
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
