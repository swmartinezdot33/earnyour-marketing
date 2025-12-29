import type { Metadata } from "next";
import Script from "next/script";
import { Oswald, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StickyMobileCTA } from "@/components/layout/StickyMobileCTA";
import { constructLocalBusinessSchema } from "@/lib/seo";
import { ToastContainer } from "@/components/ui/toast";

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

export const metadata: Metadata = {
  title: {
    default: "EarnYour Marketing | Performance First Local Growth Partner",
    template: "%s | EarnYour Marketing",
  },
  description: "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses.",
  metadataBase: new URL("https://earnyour.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
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
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          oswald.variable,
          inter.variable
        )}
      >
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-3ER5N8TNR4"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-3ER5N8TNR4');
          `}
        </Script>

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
                <StickyMobileCTA />
                <ToastContainer />
              </body>
            </html>
          );
        }
