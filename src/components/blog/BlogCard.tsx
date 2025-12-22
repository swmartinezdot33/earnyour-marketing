import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BlogCardProps {
  post: {
    slug: string;
    title: string;
    description: string;
    date: string;
    tags?: string[];
    readingTime?: string;
  };
  href?: string;
}

export function BlogCard({ post, href }: BlogCardProps) {
  const linkHref = href || `/blog/${post.slug}`;
  
  return (
    <Link href={linkHref} className="group h-full block">
      <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-none shadow-sm">
        <CardHeader>
          <div className="flex gap-2 mb-3">
            {post.tags?.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-normal">
                {tag}
              </Badge>
            ))}
          </div>
          <CardTitle className="text-xl font-bold font-heading text-brand-navy group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {post.description}
          </p>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground border-t pt-4 mt-auto">
          <span>{post.date}</span>
          <span className="mx-2">•</span>
          <span>{post.readingTime || "5 min read"}</span>
        </CardFooter>
      </Card>
    </Link>
  );
}

