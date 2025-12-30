"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, AlertTriangle } from "lucide-react";
import { showToast } from "@/components/ui/toast";
export function DeleteAccountButton() {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();

  // Get user email on mount
  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data.session?.email) {
          setUserEmail(data.session.email);
        }
      })
      .catch((err) => console.error("Error fetching session:", err));
  }, []);

  const handleDelete = async () => {
    if (emailConfirm !== userEmail) {
      showToast("Email confirmation does not match", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }

      // Redirect to home after deletion
      router.push("/");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting account:", error);
      showToast(error instanceof Error ? error.message : "Failed to delete account", "error");
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="destructive"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Account
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action will:
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Permanently delete your account and profile</li>
              <li>Remove access to all enrolled courses</li>
              <li>Delete your transaction history</li>
              <li>Remove your contact from GoHighLevel</li>
            </ul>
            <p className="text-sm font-semibold text-destructive mt-4">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Type your email address to confirm account deletion:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="email-confirm">Email Address</Label>
            <Input
              id="email-confirm"
              type="email"
              value={emailConfirm}
              onChange={(e) => setEmailConfirm(e.target.value)}
              placeholder="Enter your email"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || emailConfirm !== userEmail}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

