import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getWhitelabelAccountById, updateWhitelabelAccount } from "@/lib/db/whitelabel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import { WhitelabelAccountForm } from "@/components/admin/WhitelabelAccountForm";

export default async function WhitelabelAccountPage({
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Link href="/admin/whitelabel">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Whitelabel Accounts
        </Button>
      </Link>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{account.name}</CardTitle>
                <CardDescription>
                  Manage whitelabel account settings and branding
                </CardDescription>
              </div>
              <Badge
                variant={
                  account.status === "active"
                    ? "default"
                    : account.status === "suspended"
                    ? "destructive"
                    : "secondary"
                }
              >
                {account.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <WhitelabelAccountForm account={account} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link href={`/admin/whitelabel/${id}/users`}>
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <a
                href={`https://app.gohighlevel.com/location/${account.ghl_location_id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline">
                  Open GHL Location
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

