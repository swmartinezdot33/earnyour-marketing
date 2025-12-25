"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Settings, Users, ExternalLink, Calendar } from "lucide-react";
import type { GHLSubaccount } from "@/lib/ghl/subaccounts";
import type { WhitelabelAccount } from "@/lib/db/schema";

interface WhitelabelAccountsListProps {
  ghlSubaccounts: GHLSubaccount[];
  dbWhitelabelAccounts: WhitelabelAccount[];
}

export function WhitelabelAccountsList({
  ghlSubaccounts,
  dbWhitelabelAccounts,
}: WhitelabelAccountsListProps) {
  // Create a map of GHL location IDs to database records for quick lookup
  const dbAccountMap = new Map(
    dbWhitelabelAccounts.map((acc) => [acc.ghl_location_id, acc])
  );

  if (ghlSubaccounts.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">
            No subaccounts found in your GHL agency account.
          </p>
          <p className="text-sm text-muted-foreground">
            Subaccounts will appear here once they are created in GoHighLevel.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ghlSubaccounts.map((subaccount) => {
        const dbAccount = dbAccountMap.get(subaccount.id || "");
        const isLinked = !!dbAccount;

        return (
          <Card key={subaccount.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="truncate">{subaccount.name || "Unnamed Account"}</CardTitle>
                {isLinked ? (
                  <Badge variant="default">Linked</Badge>
                ) : (
                  <Badge variant="secondary">Not Linked</Badge>
                )}
              </div>
              <CardDescription>
                <div className="space-y-1 mt-2">
                  <p className="font-mono text-xs">
                    ID: {subaccount.id?.slice(0, 8)}...
                  </p>
                  {subaccount.companyName && (
                    <p className="text-sm">{subaccount.companyName}</p>
                  )}
                  {subaccount.email && (
                    <p className="text-xs text-muted-foreground">{subaccount.email}</p>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subaccount.createdAt && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      Created: {new Date(subaccount.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {subaccount.address && (
                  <div className="text-sm text-muted-foreground">
                    <p>{subaccount.address.address1}</p>
                    {subaccount.address.city && subaccount.address.state && (
                      <p>
                        {subaccount.address.city}, {subaccount.address.state}{" "}
                        {subaccount.address.postalCode}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <a
                      href={`https://app.gohighlevel.com/location/${subaccount.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      GHL
                    </a>
                  </Button>
                  
                  {isLinked && dbAccount && (
                    <>
                      <Link
                        href={`/admin/whitelabel/${dbAccount.id}`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          Manage
                        </Button>
                      </Link>
                      <Link
                        href={`/admin/whitelabel/${dbAccount.id}/users`}
                        className="flex-1"
                      >
                        <Button variant="outline" size="sm" className="w-full">
                          <Users className="mr-2 h-4 w-4" />
                          Users
                        </Button>
                      </Link>
                    </>
                  )}
                </div>

                {!isLinked && (
                  <Link href={`/admin/whitelabel/link?ghl_location_id=${subaccount.id}`}>
                    <Button variant="default" size="sm" className="w-full">
                      Link to Database
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}




