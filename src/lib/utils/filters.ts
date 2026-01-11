/**
 * Build Supabase query filters from filter object
 */
export interface FilterParams {
  search?: string;
  status?: string;
  role?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  courseId?: string;
  userId?: string;
}

/**
 * Apply filters to a Supabase query builder
 */
export function applyFilters<T>(
  query: any,
  filters: FilterParams,
  fieldMappings: {
    search?: string[];
    status?: string;
    role?: string;
    dateField?: string;
    amountField?: string;
    courseId?: string;
    userId?: string;
  }
): any {
  let filteredQuery = query;

  // Search filter (searches across multiple fields)
  if (filters.search && fieldMappings.search) {
    // For Supabase, we'd need to use or() for multiple fields
    // This is a simplified version - you may need to adjust based on your needs
    filteredQuery = filteredQuery.or(
      fieldMappings.search.map(field => `${field}.ilike.%${filters.search}%`).join(",")
    );
  }

  // Status filter
  if (filters.status && fieldMappings.status) {
    filteredQuery = filteredQuery.eq(fieldMappings.status, filters.status);
  }

  // Role filter
  if (filters.role && fieldMappings.role) {
    filteredQuery = filteredQuery.eq(fieldMappings.role, filters.role);
  }

  // Date range filter
  if (filters.dateFrom && fieldMappings.dateField) {
    filteredQuery = filteredQuery.gte(fieldMappings.dateField, filters.dateFrom);
  }
  if (filters.dateTo && fieldMappings.dateField) {
    filteredQuery = filteredQuery.lte(fieldMappings.dateField, filters.dateTo);
  }

  // Amount range filter
  if (filters.minAmount !== undefined && fieldMappings.amountField) {
    filteredQuery = filteredQuery.gte(fieldMappings.amountField, filters.minAmount);
  }
  if (filters.maxAmount !== undefined && fieldMappings.amountField) {
    filteredQuery = filteredQuery.lte(fieldMappings.amountField, filters.maxAmount);
  }

  // Course ID filter
  if (filters.courseId && fieldMappings.courseId) {
    filteredQuery = filteredQuery.eq(fieldMappings.courseId, filters.courseId);
  }

  // User ID filter
  if (filters.userId && fieldMappings.userId) {
    filteredQuery = filteredQuery.eq(fieldMappings.userId, filters.userId);
  }

  return filteredQuery;
}

/**
 * Build URL search params from filters
 */
export function buildFilterParams(filters: FilterParams): URLSearchParams {
  const params = new URLSearchParams();
  
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.role) params.set("role", filters.role);
  if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
  if (filters.dateTo) params.set("dateTo", filters.dateTo);
  if (filters.minAmount !== undefined) params.set("minAmount", filters.minAmount.toString());
  if (filters.maxAmount !== undefined) params.set("maxAmount", filters.maxAmount.toString());
  if (filters.courseId) params.set("courseId", filters.courseId);
  if (filters.userId) params.set("userId", filters.userId);
  
  return params;
}

/**
 * Parse filters from URL search params
 */
export function parseFilterParams(searchParams: URLSearchParams): FilterParams {
  return {
    search: searchParams.get("search") || undefined,
    status: searchParams.get("status") || undefined,
    role: searchParams.get("role") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
    minAmount: searchParams.get("minAmount") ? Number(searchParams.get("minAmount")) : undefined,
    maxAmount: searchParams.get("maxAmount") ? Number(searchParams.get("maxAmount")) : undefined,
    courseId: searchParams.get("courseId") || undefined,
    userId: searchParams.get("userId") || undefined,
  };
}




