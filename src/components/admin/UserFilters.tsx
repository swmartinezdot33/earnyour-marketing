"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

interface UserFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    role?: "admin" | "student" | "all";
    status?: "active" | "suspended" | "deleted" | "all";
    dateFrom?: Date;
    dateTo?: Date;
    hasPurchased?: boolean;
    minSpent?: number;
    maxSpent?: number;
  }) => void;
  className?: string;
}

export function UserFilters({ onFiltersChange, className }: UserFiltersProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"admin" | "student" | "all">("all");
  const [status, setStatus] = useState<"active" | "suspended" | "deleted" | "all">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [hasPurchased, setHasPurchased] = useState<string>("all");
  const [minSpent, setMinSpent] = useState<string>("");
  const [maxSpent, setMaxSpent] = useState<string>("");

  const handleApply = () => {
    onFiltersChange({
      search: search || undefined,
      role: role !== "all" ? role : undefined,
      status: status !== "all" ? status : undefined,
      dateFrom,
      dateTo,
      hasPurchased: hasPurchased !== "all" ? hasPurchased === "yes" : undefined,
      minSpent: minSpent ? Number(minSpent) : undefined,
      maxSpent: maxSpent ? Number(maxSpent) : undefined,
    });
  };

  const handleClear = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setHasPurchased("all");
    setMinSpent("");
    setMaxSpent("");
    onFiltersChange({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Role */}
        <Select value={role} onValueChange={(value) => setRole(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>

        {/* Status */}
        <Select value={status} onValueChange={(value) => setStatus(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>

        {/* Has Purchased */}
        <Select value={hasPurchased} onValueChange={setHasPurchased}>
          <SelectTrigger>
            <SelectValue placeholder="Has Purchased" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="yes">Has Purchased</SelectItem>
            <SelectItem value="no">No Purchases</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Date Range */}
        <DateRangePicker
          startDate={dateFrom}
          endDate={dateTo}
          onDateRangeChange={(start, end) => {
            setDateFrom(start);
            setDateTo(end);
          }}
        />

        {/* Spent Range */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Spent"
            value={minSpent}
            onChange={(e) => setMinSpent(e.target.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max Spent"
            value={maxSpent}
            onChange={(e) => setMaxSpent(e.target.value)}
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={handleApply}>Apply Filters</Button>
        <Button variant="outline" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

