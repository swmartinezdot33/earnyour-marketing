"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, CheckCircle2, DollarSign } from "lucide-react";

interface UserActivitySummaryProps {
  lastLogin?: string;
  coursesEnrolled: number;
  coursesCompleted: number;
  totalSpent: number;
}

export function UserActivitySummary({
  lastLogin,
  coursesEnrolled,
  coursesCompleted,
  totalSpent,
}: UserActivitySummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Activity Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {lastLogin && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="text-sm font-medium">{formatDate(lastLogin)}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Enrolled</p>
              <p className="text-sm font-medium">{coursesEnrolled}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-sm font-medium">{coursesCompleted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="text-sm font-medium">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}




