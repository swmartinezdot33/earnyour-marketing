import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/layout/Container";

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbList = [
    { label: "Home", href: "/" },
    ...items,
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbList.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `https://earnyour.com${item.href}`
    }))
  };

  return (
    <div className="bg-muted/30 py-3 border-b border-border">
      <Container>
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
            {breadcrumbList.map((item, index) => {
              const isLast = index === breadcrumbList.length - 1;
              return (
                <li key={item.href} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />}
                  {isLast ? (
                    <span className="font-medium text-foreground" aria-current="page">
                      {item.label}
                    </span>
                  ) : (
                    <Link href={item.href} className="hover:text-primary transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </Container>
    </div>
  );
}




