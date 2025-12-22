import { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/mdx";
import fs from "fs";
import path from "path";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://earnyour.com";

  // Static routes
  const routes = [
    "",
    "/about",
    "/process",
    "/pricing",
    "/contact",
    "/resources",
    "/blog",
    "/case-studies",
    "/services",
    "/services/local-seo",
    "/services/websites",
    "/services/google-ads",
    "/services/facebook-ads",
    "/services/crm-automations",
    "/services/custom-software",
    "/services/api-integrations",
    "/free-audit",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Blog Posts
  const blogPosts = await getAllPosts("blog");
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Case Studies
  const caseStudies = await getAllPosts("case-studies");
  const caseStudyRoutes = caseStudies.map((post) => ({
    url: `${baseUrl}/case-studies/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // Locations
  const citiesPath = path.join(process.cwd(), "data", "cities.json");
  const cities = JSON.parse(fs.readFileSync(citiesPath, "utf8"));
  const locationRoutes = cities.map((city: any) => ({
    url: `${baseUrl}/locations/${city.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...blogRoutes, ...caseStudyRoutes, ...locationRoutes];
}

