"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";

interface WhitelabelUsersListProps {
  users: Array<{
    id: string;
    user_id: string;
    whitelabel_id: string;
    assigned_at: string;
    user: {
      id: string;
      email: string;
      name: string | null;
    };
  }>;
  whitelabelId: string;
}

export function WhitelabelUsersList({
  users,
  whitelabelId,
}: WhitelabelUsersListProps) {
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(userId: string) {
    if (!confirm("Are you sure you want to remove this user from the whitelabel account?")) {
      return;
    }

    setRemoving(userId);

    try {
      const response = await fetch(
        `/api/admin/whitelabel/${whitelabelId}/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove user");
      }

      window.location.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRemoving(null);
    }
  }

  if (users.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No users assigned to this whitelabel account yet.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Assigned</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((assignment) => (
          <TableRow key={assignment.id}>
            <TableCell>
              {assignment.user.name || "N/A"}
            </TableCell>
            <TableCell>{assignment.user.email}</TableCell>
            <TableCell>
              {new Date(assignment.assigned_at).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemove(assignment.user_id)}
                disabled={removing === assignment.user_id}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}




