"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { DateRangePicker } from "./DateRangePicker";

interface TransactionFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    status?: "pending" | "completed" | "failed" | "all";
    dateFrom?: Date;
    dateTo?: Date;
    courseId?: string;
    userId?: string;
    minAmount?: number;
    maxAmount?: number;
  }) => void;
  courses?: Array<{ id: string; title: string }>;
  className?: string;
}

export function TransactionFilters({
  onFiltersChange,
  courses = [],
  className,
}: TransactionFiltersProps) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"pending" | "completed" | "failed" | "all">("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [courseId, setCourseId] = useState<string>("all");
  const [userId, setUserId] = useState<string>("");
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");

  const handleApply = () => {
    onFiltersChange({
      search: search || undefined,
      status: status !== "all" ? status : undefined,
      dateFrom,
      dateTo,
      courseId: courseId !== "all" ? courseId : undefined,
      userId: userId || undefined,
      minAmount: minAmount ? Number(minAmount) * 100 : undefined, // Convert to cents
      maxAmount: maxAmount ? Number(maxAmount) * 100 : undefined, // Convert to cents
    });
  };

  const handleClear = () => {
    setSearch("");
    setStatus("all");
    setDateFrom(undefined);
    setDateTo(undefined);
    setCourseId("all");
    setUserId("");
    setMinAmount("");
    setMaxAmount("");
    onFiltersChange({});
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status */}
        <Select value={status} onValueChange={(value) => setStatus(value as any)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Course */}
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User ID */}
        <Input
          placeholder="User ID or Email"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
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

        {/* Amount Range */}
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Min Amount ($)"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="w-full"
          />
          <Input
            type="number"
            placeholder="Max Amount ($)"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
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

