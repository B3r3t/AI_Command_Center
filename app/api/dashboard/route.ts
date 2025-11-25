// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDateRange, RangeKey } from "@/lib/dateRange";
import { getDashboardData } from "@/app/_data/dashboard";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const range = (searchParams.get("range") as RangeKey) ?? "7d";

  const corporateId = process.env.CORPORATE_ACCOUNT_ID;
  if (!corporateId) {
    return NextResponse.json(
      { error: "CORPORATE_ACCOUNT_ID is not set" },
      { status: 500 }
    );
  }

  const { from, to } = getDateRange(range);
  const data = await getDashboardData(corporateId, from, to);

  return NextResponse.json(data);
}
