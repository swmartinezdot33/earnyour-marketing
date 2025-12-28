"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Loader2 } from "lucide-react";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  useEffect(() => {
    params.then((p) => {
      // Redirect to builder page
      router.replace(`/admin/courses/${p.id}/builder`);
    });
  }, [params, router]);

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Container>
    </Section>
  );
}

