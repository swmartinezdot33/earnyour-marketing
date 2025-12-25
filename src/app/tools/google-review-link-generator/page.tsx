import { Metadata } from "next";
import ReviewLinkTool from "@/components/tools/ReviewLinkTool";
import { CTA } from "@/components/home/CTA";

export const metadata: Metadata = {
  title: "Free Google Review Link Generator | EarnYour Marketing",
  description: "Generate a direct link for your customers to leave 5-star Google reviews. Free tool for local businesses.",
  keywords: ["google review link generator", "get more reviews", "local seo tool"],
};

export default function ReviewLinkToolPage() {
  return (
    <>
      <ReviewLinkTool />
      <CTA />
    </>
  );
}




