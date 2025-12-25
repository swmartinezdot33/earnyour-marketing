import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/lib/db/users-admin";
import { getUserEnrollments } from "@/lib/db/enrollments";
import { getUserTransactions } from "@/lib/db/transactions";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Users as UsersIcon } from "lucide-react";
import Link from "next/link";
import { AdminUsersTable } from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = {
  title: "Admin - Users | EarnYour Marketing",
  description: "Manage users",
};

export default async function AdminUsersPage() {
  const session = await getSession();
  
  if (!session || session.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await getAllUsers(false); // Exclude deleted

  // Get additional stats for each user
  const usersWithStats = await Promise.all(
    users.map(async (user) => {
      try {
        const [enrollments, transactions] = await Promise.all([
          getUserEnrollments(user.id).catch(() => []),
          getUserTransactions(user.id).catch(() => []),
        ]);

        const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

        return {
          ...user,
          coursesCount: enrollments.length,
          totalSpent,
          transactionsCount: transactions.length,
        };
      } catch (error) {
        return {
          ...user,
          coursesCount: 0,
          totalSpent: 0,
          transactionsCount: 0,
        };
      }
    })
  );

  return (
    <Section className="pt-24 pb-16">
      <Container>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold font-heading text-brand-navy mb-2 flex items-center gap-3">
              <UsersIcon className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all users, their enrollments, and transactions
            </p>
          </div>
          <Link href="/admin/users/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New User
            </Button>
          </Link>
        </div>

        {usersWithStats.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <UsersIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No users yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Create your first user to get started.
              </p>
              <Link href="/admin/users/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First User
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <AdminUsersTable users={usersWithStats} />
        )}
      </Container>
    </Section>
  );
}




