import { Metadata } from "next";

export function constructMetadata({
  title = "EarnYour Marketing | Performance First Local Growth Partner",
  description = "Performance first local growth partner. SEO, Ads, CRM, Automations, and Custom Software for local businesses in North Mississippi.",
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
    "telephone": "+16625550123",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "123 Main Street, Suite 200",
      "addressLocality": "Southaven",
      "addressRegion": "MS",
      "postalCode": "38671",
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
    ],
    "areaServed": [
      {
        "@type": "City",
        "name": "Southaven",
        "sameAs": "https://en.wikipedia.org/wiki/Southaven,_Mississippi"
      },
      {
        "@type": "City",
        "name": "Olive Branch",
        "sameAs": "https://en.wikipedia.org/wiki/Olive_Branch,_Mississippi"
      },
      {
        "@type": "City",
        "name": "Tupelo",
        "sameAs": "https://en.wikipedia.org/wiki/Tupelo,_Mississippi"
      },
      {
        "@type": "City",
        "name": "Oxford",
        "sameAs": "https://en.wikipedia.org/wiki/Oxford,_Mississippi"
      }
    ]
  };
}

export function constructServiceAreaSchema(city: { name: string; state: string; slug: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Digital Marketing",
    "provider": {
      "@type": "LocalBusiness",
      "name": "EarnYour Marketing",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "123 Main Street, Suite 200",
        "addressLocality": "Southaven",
        "addressRegion": "MS",
        "postalCode": "38671",
        "addressCountry": "US"
      }
    },
    "areaServed": {
      "@type": "City",
      "name": city.name,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": city.name,
        "addressRegion": city.state,
        "addressCountry": "US"
      }
    },
    "url": `https://earnyour.com/locations/${city.slug}`,
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Digital Marketing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Local SEO"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Google Ads Management"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "Website Design"
          }
        }
      ]
    }
  };
}
