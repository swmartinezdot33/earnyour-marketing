import { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StudentNav } from "@/components/layout/StudentNav";
import { Container } from "@/components/layout/Container";
import { deleteSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Course | EarnYour Marketing",
  description: "Student course learning",
};

export const dynamic = "force-dynamic";

async function LogoutButton() {
  async function handleLogout() {
    "use server";
    await deleteSession();
    redirect("/login");
  }

  return (
    <form action={handleLogout}>
      <Button type="submit" variant="ghost" size="sm">
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </form>
  );
}

export default async function CourseLearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  // Redirect admins to admin dashboard
  if (session.role === "admin") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Student Header */}
      <header className="border-b bg-card">
        <Container>
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-brand-navy">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{session.email}</span>
              </div>
              <LogoutButton />
            </div>
          </div>
        </Container>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-4rem)] p-6">
          <StudentNav />
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}

