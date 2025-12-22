import { Metadata } from "next";
import { getAllPosts } from "@/lib/mdx";
import { BlogCard } from "@/components/blog/BlogCard"; // Can reuse or make a specific one
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Case Studies | EarnYour Marketing",
  description: "Real results for local businesses. See how we help companies grow revenue.",
};

export default async function CaseStudiesPage() {
  const posts = await getAllPosts("case-studies");

  return (
    <>
      <Section className="bg-brand-navy text-white py-20">
        <Container className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold font-heading mb-6">
            Proven Results
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            We don't just talk about growth. We deliver it. Here are some of our recent wins.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} href={`/case-studies/${post.slug}`} />
            ))}
          </div>
        </Container>
      </Section>
      
      <CTA />
    </>
  );
}

