import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getWhitelabelAccountById, getUsersByWhitelabel } from "@/lib/db/whitelabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { WhitelabelUsersList } from "@/components/admin/WhitelabelUsersList";

export default async function WhitelabelUsersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/login");
  }

  const { id } = await params;
  const account = await getWhitelabelAccountById(id);

  if (!account) {
    redirect("/admin/whitelabel");
  }

  const users = await getUsersByWhitelabel(id);

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href={`/admin/whitelabel/${id}`}>
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Account
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users - {account.name}</CardTitle>
              <CardDescription>
                Manage users assigned to this whitelabel account
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <WhitelabelUsersList users={users} whitelabelId={id} />
        </CardContent>
      </Card>
    </div>
  );
}




