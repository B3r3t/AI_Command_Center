// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConversationDetail } from "@/app/_data/conversations";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  const authError = requireAuth(req);

  if (authError) return authError;

  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    return NextResponse.json(
      { error: "CORPORATE_ACCOUNT_ID is not set" },
      { status: 500 }
    );
  }

  const id = context?.params?.id as string | undefined;

  if (!id) {
    return NextResponse.json(
      { error: "Missing conversation id in route params" },
      { status: 400 }
    );
  }

  const detail = await getConversationDetail(corporateId, id);

  if (!detail) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}
