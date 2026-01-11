import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllPosts } from "@/lib/mdx";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Badge } from "@/components/ui/badge";
import { CTA } from "@/components/home/CTA";

interface CaseStudyProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getAllPosts("case-studies");
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "case-studies");

  if (!post) {
    return {};
  }

  return {
    title: `${post.meta.title} | Case Study`,
    description: post.meta.description,
  };
}

export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug, "case-studies");

  if (!post) {
    notFound();
  }

  const { meta, content } = post;

  return (
    <>
      <Section className="bg-brand-navy text-white pt-32 pb-16">
        <Container className="max-w-4xl text-center">
           <div className="flex gap-2 justify-center mb-6">
             {meta.tags?.map((tag) => (
                <Badge key={tag} className="bg-primary hover:bg-primary text-white border-none">{tag}</Badge>
             ))}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold font-heading mb-6 leading-tight">
            {meta.title}
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            {meta.description}
          </p>
          {/* Stats Grid if available in meta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-white/20">
             <div className="text-center">
                <div className="text-3xl font-bold text-primary">{meta.result || "300%"}</div>
                <div className="text-sm text-white/60">Growth</div>
             </div>
             {/* Add more stats if they exist in frontmatter */}
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










