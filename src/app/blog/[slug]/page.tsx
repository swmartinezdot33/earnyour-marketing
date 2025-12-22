import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { CTA } from "@/components/home/CTA";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts("blog");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "blog");

  if (!post) {
    return {};
  }

  return {
    title: `${post.meta.title} | EarnYour Marketing`,
    description: post.meta.description,
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "blog");

  if (!post) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <>
      <Section className="bg-secondary text-secondary-foreground pt-32 pb-16">
        <Container className="max-w-4xl text-center">
          <div className="flex gap-2 justify-center mb-6">
             {meta.tags?.map((tag) => (
                <Badge key={tag} className="bg-primary hover:bg-primary text-white border-none">{tag}</Badge>
             ))}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 text-white leading-tight">
            {meta.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {meta.description}
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-white/60">
            <span>{meta.date}</span>
            <span>•</span>
            <span>{meta.readingTime || "5 min read"}</span>
            {meta.author && (
              <>
                <span>•</span>
                <span>By {meta.author}</span>
              </>
            )}
          </div>
        </Container>
      </Section>

      <Section>
        <Container className="max-w-3xl">
          <article className="prose prose-lg prose-headings:font-heading prose-headings:text-brand-navy prose-p:text-muted-foreground prose-a:text-primary max-w-none">
            {content}
          </article>
        </Container>
      </Section>

      <CTA />
    </>
  );
}

