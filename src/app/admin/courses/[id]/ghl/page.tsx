import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getSupabaseClient } from "@/lib/db/courses";
import type { Course, GHLPipeline } from "@/lib/db/schema";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Settings, TestTube } from "lucide-react";
import { getPipelines, createCoursePipeline } from "@/lib/ghl/pipelines";
import { getAutomations } from "@/lib/ghl/automations";

export const metadata: Metadata = {
  title: "GHL Integration | Admin | EarnYour Marketing",
};

export default async function CourseGHLPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const supabase = getSupabaseClient();
  const { data: courseData } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!courseData) {
    notFound();
  }

  const course = courseData as Course;

  // Get GHL pipeline configuration for this course
  const { data: pipelineConfigData } = await supabase
    .from("ghl_pipelines")
    .select("*")
    .eq("course_id", id)
    .single();
  
  const pipelineConfig = pipelineConfigData as GHLPipeline | null;

  // Fetch available pipelines and automations
  let pipelines: any[] = [];
  let automations: any[] = [];
  let defaultPipeline: any = null;

  try {
    pipelines = await getPipelines();
    automations = await getAutomations();
    
    // Get or create default course pipeline
    defaultPipeline = await createCoursePipeline();
  } catch (error) {
    console.error("Error fetching GHL data:", error);
  }

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <Link href={`/admin/courses/${id}/edit`}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Course
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            GHL Integration: {course.title}
          </h1>
          <p className="text-muted-foreground">
            Configure how this course integrates with GoHighLevel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pipeline Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Pipeline for Enrollments
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  defaultValue={pipelineConfig?.pipeline_id || defaultPipeline?.id || ""}
                >
                  <option value="">Select a pipeline...</option>
                  {pipelines.map((pipeline: any) => (
                    <option key={pipeline.id} value={pipeline.id}>
                      {pipeline.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Contacts will be moved to this pipeline when they enroll
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Default Stage
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  defaultValue={pipelineConfig?.default_stage_id || ""}
                >
                  <option value="">Select a stage...</option>
                  {pipelineConfig &&
                    defaultPipeline?.stages?.map((stage: any) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                </select>
              </div>

              <Button className="w-full">Save Pipeline Settings</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automation Triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Automation on Enrollment
                </label>
                <select
                  className="w-full p-2 border rounded-lg"
                  defaultValue={process.env.GHL_COURSE_AUTOMATION_ID || ""}
                >
                  <option value="">Select an automation...</option>
                  {automations.map((automation: any) => (
                    <option key={automation.id} value={automation.id}>
                      {automation.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  This automation will trigger when a student enrolls
                </p>
              </div>

              <Button className="w-full">Save Automation Settings</Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                Test GHL Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test the GHL sync for this course. This will create a test contact
                and verify the integration is working.
              </p>
              <Button variant="outline">Test Integration</Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}

