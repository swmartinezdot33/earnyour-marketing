import { Metadata } from "next";
import { getAllPosts } from "@/lib/mdx";
import { BlogCard } from "@/components/blog/BlogCard";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Blog | EarnYour Marketing",
  description: "Insights on Local SEO, Google Ads, and Marketing Automation for business owners.",
};

export default async function BlogPage() {
  const posts = await getAllPosts("blog");

  return (
    <>
      <Section className="bg-secondary text-secondary-foreground py-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6 text-white">
            Marketing Insights
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Actionable advice to help you grow your local business.
          </p>
        </Container>
      </Section>

      <Section className="min-h-[50vh]">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
          {posts.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              No posts found. Check back soon!
            </div>
          )}
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}










