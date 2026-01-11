"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, TestTube, CheckCircle2, XCircle } from "lucide-react";
import { getSession } from "@/lib/auth";
import { showToast } from "@/components/ui/toast";

export default function GHLSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [settings, setSettings] = useState({
    apiToken: "",
    locationId: "",
    defaultPipelineId: "",
    courseAutomationId: "",
  });

  useEffect(() => {
    // In a real app, fetch from API or database
    // For now, we'll use environment variables as defaults
    setSettings({
      apiToken: process.env.NEXT_PUBLIC_GHL_API_TOKEN || "",
      locationId: process.env.NEXT_PUBLIC_GHL_LOCATION_ID || "",
      defaultPipelineId: "",
      courseAutomationId: "",
    });
  }, []);

  const handleTestConnection = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/admin/ghl/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiToken: settings.apiToken,
          locationId: settings.locationId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: "Successfully connected to GoHighLevel!",
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "Failed to connect",
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Error testing connection",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/ghl/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await response.json();
      if (data.success) {
        showToast("Settings saved successfully!", "success");
      } else {
        showToast("Error saving settings", "error");
      }
    } catch (error) {
      showToast("Error saving settings", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="mb-8">
          <Link href="/admin">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          </Link>
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2">
            GoHighLevel Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your GoHighLevel API integration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>API Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiToken">API Token (PIT Token)</Label>
                <Input
                  id="apiToken"
                  type="password"
                  value={settings.apiToken}
                  onChange={(e) =>
                    setSettings({ ...settings, apiToken: e.target.value })
                  }
                  placeholder="Enter your GHL PIT token"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get this from your GHL account settings
                </p>
              </div>

              <div>
                <Label htmlFor="locationId">Location ID</Label>
                <Input
                  id="locationId"
                  value={settings.locationId}
                  onChange={(e) =>
                    setSettings({ ...settings, locationId: e.target.value })
                  }
                  placeholder="Enter your GHL location ID"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Your GHL location/subaccount ID
                </p>
              </div>

              <Button
                onClick={handleTestConnection}
                disabled={loading}
                className="w-full"
              >
                <TestTube className="mr-2 h-4 w-4" />
                {loading ? "Testing..." : "Test Connection"}
              </Button>

              {testResult && (
                <div
                  className={`p-3 rounded-lg flex items-center gap-2 ${
                    testResult.success
                      ? "bg-green-50 text-green-800"
                      : "bg-red-50 text-red-800"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <XCircle className="h-5 w-5" />
                  )}
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Default Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="defaultPipelineId">Default Pipeline ID</Label>
                <Input
                  id="defaultPipelineId"
                  value={settings.defaultPipelineId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      defaultPipelineId: e.target.value,
                    })
                  }
                  placeholder="Pipeline ID for course enrollments"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default pipeline to use when none is specified per course
                </p>
              </div>

              <div>
                <Label htmlFor="courseAutomationId">Course Automation ID</Label>
                <Input
                  id="courseAutomationId"
                  value={settings.courseAutomationId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      courseAutomationId: e.target.value,
                    })
                  }
                  placeholder="Automation ID to trigger on enrollment"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Automation workflow to trigger when a student enrolls
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={loading}
                className="w-full"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Custom Fields Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Make sure these custom fields exist in your GHL account:
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm">
                <li>
                  <code className="bg-muted px-2 py-1 rounded">enrolled_courses</code>{" "}
                  (Array) - List of course IDs
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">membership_status</code>{" "}
                  (String) - active, expired, cancelled
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">membership_tier</code>{" "}
                  (String) - basic, premium, enterprise
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">total_courses_enrolled</code>{" "}
                  (Number) - Count of enrolled courses
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">total_spent</code>{" "}
                  (Number) - Total amount spent
                </li>
                <li>
                  <code className="bg-muted px-2 py-1 rounded">last_course_purchase</code>{" "}
                  (Date) - Last purchase date
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </Container>
    </Section>
  );
}







