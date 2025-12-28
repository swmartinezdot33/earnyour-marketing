import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, DollarSign, Calendar } from "lucide-react";

interface MembershipStatusCardProps {
  status: {
    membershipStatus: string | null;
    membershipTier: string | null;
    enrolledCourses: string[];
    totalCoursesEnrolled: number;
    totalSpent: number;
    lastCoursePurchase: string | null;
  };
}

export function MembershipStatusCard({ status }: MembershipStatusCardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Membership Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={status.membershipStatus === "active" ? "default" : "secondary"}>
                {status.membershipStatus || "N/A"}
              </Badge>
              {status.membershipTier && (
                <span className="text-sm text-muted-foreground">
                  ({status.membershipTier})
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Courses Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{status.totalCoursesEnrolled}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Spent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${status.totalSpent.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {status.lastCoursePurchase && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Last Purchase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {new Date(status.lastCoursePurchase).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardContent>
        </Card>
      )}

      {status.enrolledCourses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Enrolled Course IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {status.enrolledCourses.map((courseId) => (
                <Badge key={courseId} variant="outline">
                  {courseId.slice(0, 8)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}







