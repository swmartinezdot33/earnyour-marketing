import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getUserById } from "@/lib/db/users";
import { getUserEnrollments } from "@/lib/db/enrollments";
import { getUserTransactions } from "@/lib/db/transactions";
import { getWhitelabelAccountForUser } from "@/lib/db/whitelabel";
import { getAllCourses } from "@/lib/db/courses";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, BookOpen, Receipt, Settings, ExternalLink } from "lucide-react";
import Link from "next/link";
import { AdminUserDetails } from "@/components/admin/AdminUserDetails";

export const metadata: Metadata = {
  title: "Admin - User Details | EarnYour Marketing",
  description: "View and manage user details",
};

export default async function AdminUserDetailPage({
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

  const [enrollments, transactions, whitelabelAccount] = await Promise.all([
    getUserEnrollments(user.id).catch(() => []),
    getUserTransactions(user.id).catch(() => []),
    getWhitelabelAccountForUser(user.id).catch(() => null),
  ]);

  // Get all courses for access management
  const allCourses = await getAllCourses(true).catch(() => []); // Include unpublished for admin

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <Link href="/admin/users" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Users
        </Link>

        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2 flex items-center gap-3">
            <User className="h-8 w-8" />
            User Details
          </h1>
          <p className="text-muted-foreground">
            View and manage user account, courses, and transactions
          </p>
        </div>

        <AdminUserDetails
          user={user}
          enrollments={enrollments}
          transactions={transactions}
          totalSpent={totalSpent}
          whitelabelAccount={whitelabelAccount}
          allCourses={allCourses}
        />
      </Container>
    </Section>
  );
}

