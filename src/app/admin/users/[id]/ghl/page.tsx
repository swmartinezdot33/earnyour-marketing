import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { getSupabaseClient } from "@/lib/db/courses";
import { ghlClient } from "@/lib/ghl/client";
import { getUserCourses } from "@/lib/ghl/courses";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, ExternalLink, Tag, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "GHL Contact | Admin | EarnYour Marketing",
};

export default async function UserGHLPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  // Get GHL contact data
  let ghlContact: any = null;
  let ghlCourses: any[] = [];
  let syncLogs: any[] = [];

  if (user.ghl_contact_id) {
    try {
      ghlContact = await ghlClient.getContactById(user.ghl_contact_id);
      ghlCourses = await getUserCourses(
        user.ghl_contact_id,
        user.ghl_location_id || undefined
      );
    } catch (error) {
      console.error("Error fetching GHL data:", error);
    }
  }

  // Get sync logs
  const supabase = getSupabaseClient();
  const { data: logs } = await supabase
    .from("ghl_sync_logs")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  syncLogs = logs || [];

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <Link href="/admin/users">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Users
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            GHL Contact: {user.name || user.email}
          </h1>
          <p className="text-muted-foreground">
            View and manage GoHighLevel integration for this user
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ghlContact ? (
                <>
                  <div>
                    <p className="text-sm font-medium mb-1">GHL Contact ID</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {ghlContact.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Email</p>
                    <p className="text-sm text-muted-foreground">{ghlContact.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Name</p>
                    <p className="text-sm text-muted-foreground">
                      {ghlContact.firstName} {ghlContact.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Phone</p>
                    <p className="text-sm text-muted-foreground">
                      {ghlContact.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {ghlContact.tags && ghlContact.tags.length > 0 ? (
                        ghlContact.tags.map((tagId: string) => (
                          <Badge key={tagId} variant="secondary">
                            <Tag className="h-3 w-3 mr-1" />
                            {tagId}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground mb-4">
                    This user is not yet synced to GHL.
                  </p>
                  <Button>Sync to GHL</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ghlContact?.customFields ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-1">Membership Status</p>
                    <Badge
                      variant={
                        ghlContact.customFields.membership_status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {ghlContact.customFields.membership_status || "unknown"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Membership Tier</p>
                    <p className="text-sm text-muted-foreground">
                      {ghlContact.customFields.membership_tier || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Courses Enrolled</p>
                    <p className="text-sm text-muted-foreground">
                      {ghlContact.customFields.total_courses_enrolled || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Total Spent</p>
                    <p className="text-sm text-muted-foreground">
                      ${ghlContact.customFields.total_spent || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1">Enrolled Courses</p>
                    <div className="space-y-1">
                      {Array.isArray(ghlContact.customFields.enrolled_courses) &&
                      ghlContact.customFields.enrolled_courses.length > 0 ? (
                        ghlContact.customFields.enrolled_courses.map(
                          (courseId: string) => (
                            <Badge key={courseId} variant="outline" className="mr-1">
                              {courseId}
                            </Badge>
                          )
                        )
                      ) : (
                        <p className="text-sm text-muted-foreground">No courses</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No custom fields set</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Enrolled Courses (from GHL)</CardTitle>
            </CardHeader>
            <CardContent>
              {ghlCourses.length > 0 ? (
                <div className="space-y-2">
                  {ghlCourses.map((course) => (
                    <div
                      key={course.courseId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{course.courseName || course.courseId}</p>
                        <p className="text-sm text-muted-foreground">
                          Enrolled: {new Date(course.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={course.completed ? "default" : "secondary"}>
                        {course.completed ? "Completed" : "In Progress"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No courses found in GHL</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sync Logs</CardTitle>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {syncLogs.length > 0 ? (
                <div className="space-y-2">
                  {syncLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{log.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge
                        variant={
                          log.status === "success"
                            ? "default"
                            : log.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {log.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No sync logs yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}




