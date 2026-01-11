"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StripeStatus {
  configured: boolean;
  testMode: boolean;
  accountId?: string;
  accountName?: string;
}

export function StripeSetup() {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    checkStripeStatus();
  }, []);

  const checkStripeStatus = async () => {
    try {
      const response = await fetch("/api/admin/stripe/status");
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error("Error checking Stripe status:", error);
      setStatus({ configured: false, testMode: false });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch("/api/admin/stripe/test");
      const data = await response.json();
      setTestResult({
        success: data.success,
        message: data.message || (data.success ? "Connection successful!" : "Connection failed"),
      });
      if (data.success) {
        checkStripeStatus(); // Refresh status
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: "Failed to test connection",
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isConfigured = status?.configured || false;
  const isTestMode = status?.testMode || false;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Stripe Configuration Status
            {isConfigured ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {isConfigured
              ? "Stripe is configured and ready to process payments"
              : "Configure Stripe to enable payment processing for your courses"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConfigured && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <Badge variant={isTestMode ? "secondary" : "default"}>
                  {isTestMode ? "Test Mode" : "Live Mode"}
                </Badge>
              </div>
              {status?.accountName && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Account:</span>
                  <span className="text-sm font-medium">{status.accountName}</span>
                </div>
              )}
            </div>
          )}

          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={testing || !isConfigured}>
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                "Test Connection"
              )}
            </Button>
            {isConfigured && (
              <Button variant="outline" asChild>
                <a
                  href="https://dashboard.stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Stripe Dashboard
                </a>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>
            Follow these steps to configure Stripe for your platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Get Your Stripe API Keys</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Log in to your Stripe Dashboard and navigate to Developers → API keys
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a
                    href="https://dashboard.stripe.com/apikeys"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get API Keys
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Add to Environment Variables</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Add your Stripe Secret Key to your environment variables:
                </p>
                <div className="bg-muted p-3 rounded-md font-mono text-sm">
                  <code>STRIPE_SECRET_KEY=sk_live_...</code>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  For testing, use <code>sk_test_...</code> keys. For production, use <code>sk_live_...</code> keys.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Test Your Connection</h3>
                <p className="text-sm text-muted-foreground">
                  After adding your API key, click "Test Connection" above to verify your setup.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
              <span>
                <strong>Security:</strong> Never commit your Stripe secret keys to version control.
                Always use environment variables.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
              <span>
                <strong>Test Mode:</strong> Use test keys during development. Switch to live keys
                only when ready for production.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
              <span>
                <strong>Webhooks:</strong> Make sure to configure Stripe webhooks for payment
                events. See the webhook setup guide for details.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}




