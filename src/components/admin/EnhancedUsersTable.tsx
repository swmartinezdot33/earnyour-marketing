"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { UserFilters } from "./UserFilters";
import { BulkActionsBar } from "./BulkActionsBar";
import { ExportButton } from "./ExportButton";
import { UserActivitySummary } from "./UserActivitySummary";
import { arrayToCSV, downloadCSV, formatDateForCSV, formatCurrencyForCSV } from "@/lib/utils/export";
import type { User } from "@/lib/db/schema";

interface UserWithStats extends User {
  coursesCount: number;
  totalSpent: number;
  transactionsCount: number;
  coursesCompleted?: number;
  lastLogin?: string;
}

interface EnhancedUsersTableProps {
  initialUsers: UserWithStats[];
}

export function EnhancedUsersTable({ initialUsers }: EnhancedUsersTableProps) {
  const [users, setUsers] = useState<UserWithStats[]>(initialUsers);
  const [filteredUsers, setFilteredUsers] = useState<UserWithStats[]>(initialUsers);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<{
    search?: string;
    role?: "admin" | "student" | "all";
    status?: "active" | "suspended" | "deleted" | "all";
    dateFrom?: Date;
    dateTo?: Date;
    hasPurchased?: boolean;
    minSpent?: number;
    maxSpent?: number;
  }>({});

  // Apply filters
  useEffect(() => {
    let filtered = [...users];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.email.toLowerCase().includes(searchLower) ||
          (u.name && u.name.toLowerCase().includes(searchLower)) ||
          u.role.toLowerCase().includes(searchLower)
      );
    }

    if (filters.role && filters.role !== "all") {
      filtered = filtered.filter((u) => u.role === filters.role);
    }

    if (filters.status && filters.status !== "all") {
      filtered = filtered.filter((u) => u.status === filters.status);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(
        (u) => new Date(u.created_at) >= filters.dateFrom!
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(
        (u) => new Date(u.created_at) <= filters.dateTo!
      );
    }

    if (filters.hasPurchased !== undefined) {
      filtered = filtered.filter((u) =>
        filters.hasPurchased ? u.transactionsCount > 0 : u.transactionsCount === 0
      );
    }

    if (filters.minSpent !== undefined) {
      filtered = filtered.filter((u) => u.totalSpent >= filters.minSpent! * 100);
    }

    if (filters.maxSpent !== undefined) {
      filtered = filtered.filter((u) => u.totalSpent <= filters.maxSpent! * 100);
    }

    setFilteredUsers(filtered);
  }, [filters, users]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(new Set(filteredUsers.map((u) => u.id)));
    } else {
      setSelectedUsers(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUsers);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleToggleExpand = (userId: string) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
  };

  const handleBulkActivate = async () => {
    // TODO: Implement bulk activate
    console.log("Bulk activate:", Array.from(selectedUsers));
  };

  const handleBulkSuspend = async () => {
    // TODO: Implement bulk suspend
    console.log("Bulk suspend:", Array.from(selectedUsers));
  };

  const handleBulkExport = () => {
    const csvData = filteredUsers.map((user) => ({
      Email: user.email,
      Name: user.name || "",
      Role: user.role,
      Status: user.status,
      "Courses Enrolled": user.coursesCount,
      "Courses Completed": user.coursesCompleted || 0,
      "Total Spent": formatCurrencyForCSV(user.totalSpent),
      "Transactions": user.transactionsCount,
      "Created At": formatDateForCSV(user.created_at),
    }));

    const csv = arrayToCSV(csvData);
    const filename = `users-${new Date().toISOString().split("T")[0]}.csv`;
    downloadCSV(csv, filename);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const allSelected = filteredUsers.length > 0 && selectedUsers.size === filteredUsers.length;
  const someSelected = selectedUsers.size > 0 && selectedUsers.size < filteredUsers.length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <UserFilters onFiltersChange={setFilters} />
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <BulkActionsBar
          selectedCount={selectedUsers.size}
          onBulkActivate={handleBulkActivate}
          onBulkSuspend={handleBulkSuspend}
          onBulkExport={handleBulkExport}
          actions={["activate", "suspend", "export"]}
        />
      )}

      {/* Export Button */}
      <div className="flex justify-end">
        <ExportButton onExport={handleBulkExport} />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const isExpanded = expandedUsers.has(user.id);
                    return (
                      <>
                        <TableRow key={user.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedUsers.has(user.id)}
                              onCheckedChange={(checked) =>
                                handleSelectUser(user.id, checked as boolean)
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleExpand(user.id)}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.name || "—"}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.coursesCount}</TableCell>
                          <TableCell>{formatCurrency(user.totalSpent)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                user.status === "active"
                                  ? "default"
                                  : user.status === "suspended"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {user.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href={`/admin/users/${user.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={9} className="bg-muted/50">
                              <div className="p-4">
                                <UserActivitySummary
                                  lastLogin={user.lastLogin}
                                  coursesEnrolled={user.coursesCount}
                                  coursesCompleted={user.coursesCompleted || 0}
                                  totalSpent={user.totalSpent}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

