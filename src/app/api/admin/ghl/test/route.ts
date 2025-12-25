import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { GHLClient } from "@/lib/ghl/client";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { apiToken, locationId } = body;

    if (!apiToken || !locationId) {
      return NextResponse.json(
        { success: false, error: "API token and location ID are required" },
        { status: 400 }
      );
    }

    // Test connection by trying to fetch tags
    const client = new GHLClient(apiToken, locationId);
    await client.request(`/tags/v2/locations/${locationId}`);

    return NextResponse.json({
      success: true,
      message: "Successfully connected to GoHighLevel",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to connect to GoHighLevel",
      },
      { status: 500 }
    );
  }
}




