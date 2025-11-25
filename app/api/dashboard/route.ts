// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getDashboardData } from "@/app/_data/dashboard";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const authError = requireAuth(req);

  if (authError) return authError;

  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    return NextResponse.json(
      { error: "CORPORATE_ACCOUNT_ID is not set" },
      { status: 500 }
    );
  }

  // We no longer use date ranges — dashboard is all-time right now
  const data = await getDashboardData(corporateId);

  return NextResponse.json(data);
}
