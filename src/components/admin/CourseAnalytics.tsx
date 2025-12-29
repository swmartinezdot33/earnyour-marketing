"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, DollarSign, BookOpen, TrendingUp, Clock } from "lucide-react";

interface CourseAnalyticsProps {
  courseId: string;
}

export function CourseAnalytics({ courseId }: CourseAnalyticsProps) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [courseId]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${courseId}/analytics`);
      const data = await response.json();
      if (data.success) {
        setAnalytics(data.analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No analytics data available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalEnrollments || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeEnrollments || 0} active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.totalRevenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalSales || 0} total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.completionRate ? `${Math.round(analytics.completionRate)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.completedStudents || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averageProgress ? `${Math.round(analytics.averageProgress)}%` : "0%"}
            </div>
            <p className="text-xs text-muted-foreground">
              Average completion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.recentEnrollments?.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentEnrollments.slice(0, 5).map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(enrollment.created_at).toLocaleDateString()}
                    </span>
                    <span className="font-medium">{enrollment.user_email || "User"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No enrollments yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topLessons?.length > 0 ? (
              <div className="space-y-2">
                {analytics.topLessons.slice(0, 5).map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground truncate flex-1">{lesson.title}</span>
                    <span className="font-medium ml-2">
                      {Math.round(lesson.completion_rate || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

