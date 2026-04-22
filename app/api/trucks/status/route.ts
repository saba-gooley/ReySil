import { getTruckStatusByDate } from "@/lib/server/trucks/queries";
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

    const data = await getTruckStatusByDate(fecha);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in /api/trucks/status:", error);
    return NextResponse.json(
      { error: "Failed to fetch truck status" },
      { status: 500 }
    );
  }
}
