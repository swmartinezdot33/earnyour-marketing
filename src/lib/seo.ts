import { Metadata } from "next";

export function constructMetadata({
  title = "EarnYour Marketing | Performance First Local Growth Partner",
  description = "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses.",
  image = "/og-image.jpg",
  icons = "/favicon.ico",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  icons?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@earnyour",
    },
    icons,
    metadataBase: new URL("https://earnyour.com"),
    ...(noIndex && {
      robots: {
        index: false,
        follow: false,
      },
    }),
  };
}

export function constructLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "EarnYour Marketing",
    "image": "https://earnyour.com/og-image.jpg",
    "email": "hello@earnyour.com",
    "telephone": "+15125550123",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Growth Street, Suite 100",
      "addressLocality": "Austin",
      "addressRegion": "TX",
      "postalCode": "78701",
      "addressCountry": "US"
    },
    "url": "https://earnyour.com",
    "priceRange": "$$$",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday"
        ],
        "opens": "09:00",
        "closes": "17:00"
      }
    ]
  };
}

