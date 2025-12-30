"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BookOpen, Receipt, Settings, ExternalLink, User as UserIcon, Edit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User, Enrollment } from "@/lib/db/schema";
import { CourseAccessManager } from "@/components/admin/CourseAccessManager";
import { UserEditDialog } from "./UserEditDialog";

interface Transaction {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
  };
  amount: number;
  currency: string;
  status: string;
  created_at: string;
}

interface WhitelabelAccount {
  id: string;
  name: string;
  ghl_location_id: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

interface AdminUserDetailsProps {
  user: User;
  enrollments: (Enrollment & { course: any })[];
  transactions: Transaction[];
  totalSpent: number;
  whitelabelAccount: WhitelabelAccount | null;
  allCourses: Course[];
}

export function AdminUserDetails({
  user: initialUser,
  enrollments,
  transactions,
  totalSpent,
  whitelabelAccount,
  allCourses,
}: AdminUserDetailsProps) {
  const [user, setUser] = useState(initialUser);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleUserUpdated = async () => {
    // Refresh user data
    try {
      const response = await fetch(`/api/admin/users/${user.id}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.user) {
          setUser(result.user);
        }
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{user.email}</CardTitle>
              <CardDescription>
                User ID: {user.id}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                {user.role}
              </Badge>
              <Badge
                variant={
                  user.status === "active"
                    ? "default"
                    : user.status === "suspended"
                    ? "secondary"
                    : "destructive"
                }
              >
                {user.status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg">{user.name || "—"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <p className="text-lg">
                {new Date(user.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            {user.ghl_contact_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">GHL Contact ID</label>
                <p className="text-lg font-mono text-sm">{user.ghl_contact_id}</p>
              </div>
            )}
            {user.ghl_location_id && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">GHL Location ID</label>
                <p className="text-lg font-mono text-sm">{user.ghl_location_id}</p>
              </div>
            )}
          </div>

          {whitelabelAccount && (
            <>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Whitelabel Account</label>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-lg">{whitelabelAccount.name}</p>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`https://app.gohighlevel.com/location/${whitelabelAccount.ghl_location_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View in GHL
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditingUser(user)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit User
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  {user.ghl_contact_id ? (
                    <Link href={`/admin/users/${user.id}/ghl`}>
                      <Button variant="outline" size="sm">
                        More Details
                      </Button>
                    </Link>
                  ) : (
                    <span>
                      <Button variant="outline" size="sm" disabled>
                        More Details
                      </Button>
                    </span>
                  )}
                </TooltipTrigger>
                {!user.ghl_contact_id && (
                  <TooltipContent>
                    <p>Not associated to CRM contact</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      {/* Enrolled Courses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Enrolled Courses ({enrollments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {enrollments.length === 0 ? (
            <p className="text-muted-foreground">No enrolled courses</p>
          ) : (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold">{enrollment.course?.title || "Unknown Course"}</p>
                    <p className="text-sm text-muted-foreground">
                      Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      {enrollment.completed_at && (
                        <> • Completed: {new Date(enrollment.completed_at).toLocaleDateString()}</>
                      )}
                    </p>
                  </div>
                  <Badge variant={enrollment.completed_at ? "default" : "secondary"}>
                    {enrollment.completed_at ? "Completed" : "In Progress"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Access Management */}
      <Card>
        <CardHeader>
          <CardTitle>Course Access Management</CardTitle>
          <CardDescription>
            Grant or revoke course access for this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CourseAccessManager userId={user.id} courses={allCourses} enrollments={enrollments} />
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History ({transactions.length})
          </CardTitle>
          <CardDescription>
            Total Spent: {transactions.length > 0 ? formatCurrency(totalSpent, transactions[0].currency) : "$0.00"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-muted-foreground">No transactions</p>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-semibold">{transaction.course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(transaction.amount, transaction.currency)}</p>
                    <Badge
                      variant={
                        transaction.status === "completed"
                          ? "default"
                          : transaction.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                      className="mt-1"
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {transactions.length > 10 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  Showing 10 of {transactions.length} transactions
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      {editingUser && (
        <UserEditDialog
          user={editingUser}
          open={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUpdate={handleUserUpdated}
        />
      )}
    </div>
  );
}

