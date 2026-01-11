"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  courseCount: number;
  courseTitle?: string;
  loading?: boolean;
}

export function DeleteCourseDialog({
  open,
  onClose,
  onConfirm,
  courseCount,
  courseTitle,
  loading = false,
}: DeleteCourseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Delete {courseCount === 1 ? "Course" : "Courses"}?</DialogTitle>
              <DialogDescription className="mt-2">
                {courseCount === 1 ? (
                  <>
                    Are you sure you want to delete <strong>{courseTitle}</strong>? This action
                    cannot be undone and will permanently delete the course, all modules, lessons,
                    and associated data.
                  </>
                ) : (
                  <>
                    Are you sure you want to delete <strong>{courseCount} courses</strong>? This
                    action cannot be undone and will permanently delete all selected courses, their
                    modules, lessons, and associated data.
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Deleting..." : `Delete ${courseCount === 1 ? "Course" : "Courses"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}




