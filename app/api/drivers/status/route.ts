import { getDriverStatusByDate } from "@/lib/server/drivers/queries";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const fecha = request.nextUrl.searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json(
        { error: "Missing fecha parameter" },
        { status: 400 }
      );
    }

    const data = await getDriverStatusByDate(fecha);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/drivers/status:", error);
    return NextResponse.json(
      { error: "Failed to fetch driver status" },
      { status: 500 }
    );
  }
}
