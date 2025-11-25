// app/api/conversations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getConversationDetail } from "@/app/_data/conversations";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, context: any) {
  const authResult = await authenticateRequest(req);

  if ("response" in authResult) {
    return authResult.response;
  }
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

  const userCorporateId =
    (authResult.user.user_metadata?.corporate_account_id as string | undefined) ??
    (authResult.user.user_metadata?.corporateAccountId as string | undefined) ??
    (authResult.user.app_metadata?.corporate_account_id as string | undefined);

  if (userCorporateId && userCorporateId !== corporateId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const id = context?.params?.id as string | undefined;

  if (!id) {
    return NextResponse.json(
      { error: "Missing conversation id in route params" },
      { status: 400 }
    );
  }

  const detail = await getConversationDetail(corporateId, id, authResult.supabase);

  if (!detail) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}

export async function PUT(req: NextRequest, context: any) {
  const authResult = await authenticateRequest(req);

  if ("response" in authResult) {
    return authResult.response;
  }

  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    return NextResponse.json(
      { error: "CORPORATE_ACCOUNT_ID is not set" },
      { status: 500 }
    );
  }

  const userCorporateId =
    (authResult.user.user_metadata?.corporate_account_id as string | undefined) ??
    (authResult.user.user_metadata?.corporateAccountId as string | undefined) ??
    (authResult.user.app_metadata?.corporate_account_id as string | undefined);

  if (userCorporateId && userCorporateId !== corporateId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}

export async function DELETE(req: NextRequest, context: any) {
  const authResult = await authenticateRequest(req);

  if ("response" in authResult) {
    return authResult.response;
  }

  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    return NextResponse.json(
      { error: "CORPORATE_ACCOUNT_ID is not set" },
      { status: 500 }
    );
  }

  const userCorporateId =
    (authResult.user.user_metadata?.corporate_account_id as string | undefined) ??
    (authResult.user.user_metadata?.corporateAccountId as string | undefined) ??
    (authResult.user.app_metadata?.corporate_account_id as string | undefined);

  if (userCorporateId && userCorporateId !== corporateId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
