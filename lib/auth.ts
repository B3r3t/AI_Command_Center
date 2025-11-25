import { NextRequest, NextResponse } from "next/server";

export function requireAuth(req: NextRequest) {
  const expectedToken = process.env.API_AUTH_TOKEN;

  if (!expectedToken) {
    return NextResponse.json(
      { error: "API_AUTH_TOKEN is not set" },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization") ?? "";

  if (!authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Missing bearer token" },
      { status: 401 }
    );
  }

  const token = authHeader.slice("Bearer ".length).trim();

  if (token !== expectedToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  return null;
}
