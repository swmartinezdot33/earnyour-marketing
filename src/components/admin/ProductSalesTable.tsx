"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SalesByProduct } from "@/lib/db/analytics";

interface ProductSalesTableProps {
  data: SalesByProduct[];
  onSort?: (field: keyof SalesByProduct) => void;
  sortField?: keyof SalesByProduct;
  sortDirection?: "asc" | "desc";
}

export function ProductSalesTable({
  data,
  onSort,
  sortField,
  sortDirection,
}: ProductSalesTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = data.filter((item) =>
    item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount / 100);
  };

  const handleSort = (field: keyof SalesByProduct) => {
    if (onSort) {
      onSort(field);
    }
  };

  const SortButton = ({ field }: { field: keyof SalesByProduct }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 px-2"
      onClick={() => handleSort(field)}
    >
      <ArrowUpDown className="h-4 w-4" />
    </Button>
  );

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <div className="flex items-center gap-2">
                    Product Name
                    {onSort && <SortButton field="courseTitle" />}
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    Sales
                    {onSort && <SortButton field="sales" />}
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    Revenue
                    {onSort && <SortButton field="revenue" />}
                  </div>
                </TableHead>
                <TableHead className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    Conversion Rate
                    {onSort && <SortButton field="conversionRate" />}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((item) => (
                  <TableRow key={item.courseId}>
                    <TableCell className="font-medium">{item.courseTitle}</TableCell>
                    <TableCell className="text-right">{item.sales}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right">
                      {item.conversionRate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

