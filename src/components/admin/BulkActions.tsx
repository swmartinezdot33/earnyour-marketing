"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, Copy, Move } from "lucide-react";

interface BulkActionsProps {
  selectedItems: string[];
  onDelete?: (ids: string[]) => void;
  onCopy?: (ids: string[]) => void;
  onMove?: (ids: string[]) => void;
  type: "modules" | "lessons";
}

export function BulkActions({
  selectedItems,
  onDelete,
  onCopy,
  onMove,
  type,
}: BulkActionsProps) {
  const [loading, setLoading] = useState(false);

  if (selectedItems.length === 0) {
    return null;
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} ${type}?`)) {
      return;
    }

    setLoading(true);
    try {
      if (onDelete) {
        await onDelete(selectedItems);
      }
    } catch (error) {
      console.error("Error deleting items:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="sticky top-0 z-10 border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {selectedItems.length} {type} selected
            </span>
          </div>
          <div className="flex gap-2">
            {onCopy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCopy(selectedItems)}
                disabled={loading}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            )}
            {onMove && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMove(selectedItems)}
                disabled={loading}
              >
                <Move className="mr-2 h-4 w-4" />
                Move
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

