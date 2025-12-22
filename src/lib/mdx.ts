import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import { components } from "@/components/mdx/mdx-components";

const rootDirectory = path.join(process.cwd(), "content");

export const getPostBySlug = async (slug: string, type: "blog" | "case-studies") => {
  const realSlug = slug.replace(/\.mdx$/, "");
  const filePath = path.join(rootDirectory, type, `${realSlug}.mdx`);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const { frontmatter, content } = await compileMDX<{
      title: string;
      date: string;
      description: string;
      image?: string;
      tags?: string[];
      author?: string;
      readingTime?: string;
      result?: string;
      industry?: string;
    }>({
      source: fileContent,
      options: { parseFrontmatter: true },
      components: components,
    });

    return { meta: { ...frontmatter, slug: realSlug }, content };
  } catch (error) {
    return null;
  }
};

export const getAllPosts = async (type: "blog" | "case-studies") => {
  const dirPath = path.join(rootDirectory, type);
  
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = fs.readdirSync(dirPath);

  const posts = await Promise.all(
    files.map(async (file) => {
      const { meta } = (await getPostBySlug(file, type)) || {};
      return meta;
    })
  );

  return posts
    .filter((post): post is NonNullable<typeof post> => !!post)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

