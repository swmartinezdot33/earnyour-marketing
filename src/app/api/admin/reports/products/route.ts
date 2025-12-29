import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import {
  getSalesByProduct,
  getRevenueTrends,
  getTopPerformers,
  getConversionRates,
} from "@/lib/db/analytics";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") as "30days" | "12months") || "30days";
    const startDate = searchParams.get("startDate") 
      ? new Date(searchParams.get("startDate")!)
      : undefined;
    const endDate = searchParams.get("endDate")
      ? new Date(searchParams.get("endDate")!)
      : undefined;

    // Get all report data
    const [salesByProduct, revenueTrends, topByRevenue, topBySales, topByConversion, conversionRates] = await Promise.all([
      getSalesByProduct(startDate, endDate),
      getRevenueTrends(period),
      getTopPerformers("revenue", 10),
      getTopPerformers("sales", 10),
      getTopPerformers("conversion", 10),
      getConversionRates(),
    ]);

    return NextResponse.json({
      salesByProduct,
      revenueTrends,
      topPerformers: {
        byRevenue: topByRevenue,
        bySales: topBySales,
        byConversion: topByConversion,
      },
      conversionRates,
    });
  } catch (error) {
    console.error("Product reports API error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch product reports",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

