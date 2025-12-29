"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X, Settings } from "lucide-react";
import Link from "next/link";

interface StripeStatus {
  configured: boolean;
  testMode: boolean;
  error?: string;
}

interface StripeWarningBannerProps {
  showOnConfigured?: boolean; // Show even if configured (for test mode warnings)
  className?: string;
}

export function StripeWarningBanner({ showOnConfigured = false, className }: StripeWarningBannerProps) {
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

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
      setStatus({ configured: false, testMode: false, error: "Failed to check Stripe status" });
    } finally {
      setLoading(false);
    }
  };

  if (loading || dismissed) {
    return null;
  }

  if (!status) {
    return null;
  }

  // Don't show if configured and showOnConfigured is false
  if (status.configured && !showOnConfigured) {
    return null;
  }

  // Show warning if not configured
  if (!status.configured) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <strong>Stripe Integration Not Configured</strong>
            <p className="text-sm mt-1">
              Payment processing is disabled. Configure Stripe to enable course purchases.
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link href="/admin/settings/stripe">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Configure Stripe
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show warning if in test mode
  if (status.testMode && showOnConfigured) {
    return (
      <Alert className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <div className="flex-1">
            <strong>Stripe Test Mode Active</strong>
            <p className="text-sm mt-1">
              You're using Stripe test keys. Switch to live keys for production payments.
            </p>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Link href="/admin/settings/stripe">
              <Button variant="outline" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                View Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}

