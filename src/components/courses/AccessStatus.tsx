"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface AccessStatusProps {
  hasAccess: boolean;
  source?: "database" | "ghl" | "both";
  membershipStatus?: "active" | "expired" | "cancelled" | "unknown";
  membershipTier?: "basic" | "premium" | "enterprise";
  expirationDate?: string | null;
}

export function AccessStatus({
  hasAccess,
  source,
  membershipStatus,
  membershipTier,
  expirationDate,
}: AccessStatusProps) {
  if (!hasAccess) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">Access Denied</p>
              <p className="text-sm text-red-700">
                You don't have access to this course. Please enroll to continue.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Access Granted</p>
              <div className="flex items-center gap-2 mt-1">
                {source && (
                  <Badge variant="secondary" className="text-xs">
                    {source === "both"
                      ? "Database + GHL"
                      : source === "ghl"
                      ? "GHL"
                      : "Database"}
                  </Badge>
                )}
                {membershipStatus && membershipStatus !== "unknown" && (
                  <Badge
                    variant={
                      membershipStatus === "active" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {membershipStatus}
                  </Badge>
                )}
                {membershipTier && (
                  <Badge variant="outline" className="text-xs">
                    {membershipTier}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {expirationDate && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className="text-sm font-medium">
                {new Date(expirationDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}




