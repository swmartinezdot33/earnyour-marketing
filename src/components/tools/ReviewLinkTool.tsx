"use client";

import { useState } from "react";
import { Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export default function ReviewLinkTool() {
  const [placeId, setPlaceId] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    const link = `https://search.google.com/local/writereview?placeid=${placeId}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Free Tools", href: "/resources" }, { label: "Review Link Generator", href: "/tools/google-review-link-generator" }]} />
      
      <Section className="bg-brand-navy text-white pt-20 pb-16">
        <Container className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-6">
            Google Review Link Generator
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            The easiest way to get more 5-star reviews. Create a direct link that opens the "Write a Review" box instantly.
          </p>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Create Your Link</CardTitle>
                <CardDescription>
                  Enter your Google Place ID below. Don't know it? <a href="https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder" target="_blank" rel="noreferrer" className="text-primary underline">Find it here</a> first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Google Place ID</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="e.g. ChIJ..." 
                      value={placeId}
                      onChange={(e) => setPlaceId(e.target.value)}
                    />
                    <Button onClick={handleGenerate} disabled={!placeId}>
                      Generate Link
                    </Button>
                  </div>
                </div>

                {generatedLink && (
                  <div className="p-4 bg-muted/50 rounded-lg space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Your Direct Review Link:</label>
                      <div className="flex gap-2">
                        <Input value={generatedLink} readOnly className="bg-white font-mono text-sm" />
                        <Button variant="outline" size="icon" onClick={copyToClipboard}>
                          {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-brand-navy">Test It:</label>
                      <div>
                        <a 
                          href={generatedLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center text-primary hover:underline text-sm font-bold"
                        >
                          Open Link <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 p-4 rounded text-sm text-blue-800">
                      <strong>Pro Tip:</strong> Send this link to your customers via SMS immediately after a job is done. Need an automated system for this? <a href="/services/crm-automations" className="underline">Check out our automation services.</a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="mt-12 text-center space-y-4">
              <h3 className="text-2xl font-bold font-heading text-brand-navy">Why this matters</h3>
              <p className="text-muted-foreground">
                Asking customers to "Go to Google and search for us" adds too much friction. Most people give up.
                Sending a direct link that pops open the review box increases conversion rates by over 300%.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
