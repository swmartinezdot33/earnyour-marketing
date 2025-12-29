import { format } from "date-fns";

/**
 * Format currency for chart tooltips
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100); // Assuming amounts are in cents
}

/**
 * Format date for chart labels
 */
export function formatChartDate(date: string | Date, formatType: "day" | "month" | "year" = "day"): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  switch (formatType) {
    case "day":
      return format(dateObj, "MMM d");
    case "month":
      return format(dateObj, "MMM yyyy");
    case "year":
      return format(dateObj, "yyyy");
    default:
      return format(dateObj, "MMM d, yyyy");
  }
}

/**
 * Group data by date period
 */
export function groupByDatePeriod<T extends { date: string }>(
  data: T[],
  period: "day" | "week" | "month"
): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  data.forEach((item) => {
    const date = new Date(item.date);
    let key: string;

    switch (period) {
      case "day":
        key = format(date, "yyyy-MM-dd");
        break;
      case "week":
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = format(weekStart, "yyyy-MM-dd");
        break;
      case "month":
        key = format(date, "yyyy-MM");
        break;
      default:
        key = format(date, "yyyy-MM-dd");
    }

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  return grouped;
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

