"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Check, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkPublish?: () => void;
  onBulkUnpublish?: () => void;
  onBulkActivate?: () => void;
  onBulkSuspend?: () => void;
  onBulkExport?: () => void;
  actions?: Array<"delete" | "publish" | "unpublish" | "activate" | "suspend" | "export">;
  className?: string;
}

export function BulkActionsBar({
  selectedCount,
  onBulkDelete,
  onBulkPublish,
  onBulkUnpublish,
  onBulkActivate,
  onBulkSuspend,
  onBulkExport,
  actions = ["delete", "export"],
  className,
}: BulkActionsBarProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-muted rounded-lg border",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">
          {selectedCount} item{selectedCount !== 1 ? "s" : ""} selected
        </span>
      </div>

      <div className="flex items-center gap-2">
        {actions.includes("publish") && onBulkPublish && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkPublish}
          >
            <Check className="mr-2 h-4 w-4" />
            Publish
          </Button>
        )}

        {actions.includes("unpublish") && onBulkUnpublish && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkUnpublish}
          >
            <X className="mr-2 h-4 w-4" />
            Unpublish
          </Button>
        )}

        {actions.includes("activate") && onBulkActivate && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkActivate}
          >
            <Check className="mr-2 h-4 w-4" />
            Activate
          </Button>
        )}

        {actions.includes("suspend") && onBulkSuspend && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkSuspend}
          >
            <X className="mr-2 h-4 w-4" />
            Suspend
          </Button>
        )}

        {actions.includes("export") && onBulkExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBulkExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}

        {actions.includes("delete") && onBulkDelete && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}

        {actions.length > 2 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.includes("publish") && onBulkPublish && (
                <DropdownMenuItem onClick={onBulkPublish}>
                  <Check className="mr-2 h-4 w-4" />
                  Publish Selected
                </DropdownMenuItem>
              )}
              {actions.includes("unpublish") && onBulkUnpublish && (
                <DropdownMenuItem onClick={onBulkUnpublish}>
                  <X className="mr-2 h-4 w-4" />
                  Unpublish Selected
                </DropdownMenuItem>
              )}
              {actions.includes("activate") && onBulkActivate && (
                <DropdownMenuItem onClick={onBulkActivate}>
                  <Check className="mr-2 h-4 w-4" />
                  Activate Selected
                </DropdownMenuItem>
              )}
              {actions.includes("suspend") && onBulkSuspend && (
                <DropdownMenuItem onClick={onBulkSuspend}>
                  <X className="mr-2 h-4 w-4" />
                  Suspend Selected
                </DropdownMenuItem>
              )}
              {actions.includes("export") && onBulkExport && (
                <DropdownMenuItem onClick={onBulkExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
              )}
              {actions.includes("delete") && onBulkDelete && (
                <DropdownMenuItem onClick={onBulkDelete} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Selected
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}




