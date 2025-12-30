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
import { showToast } from "@/components/ui/toast";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

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
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; userId: string | null }>({ open: false, userId: null });

  async function handleRemove(userId: string) {
    setDeleteConfirm({ open: true, userId });
  }

  async function confirmRemove() {
    if (!deleteConfirm.userId) return;

    setRemoving(deleteConfirm.userId);

    try {
      const response = await fetch(
        `/api/admin/whitelabel/${whitelabelId}/users/${deleteConfirm.userId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove user");
      }

      showToast("User removed successfully", "success");
      window.location.reload();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "An error occurred", "error");
      setRemoving(null);
    } finally {
      setDeleteConfirm({ open: false, userId: null });
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
    <>
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

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Remove User"
        description="Are you sure you want to remove this user from the whitelabel account?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={confirmRemove}
      />
    </>
  );
}







