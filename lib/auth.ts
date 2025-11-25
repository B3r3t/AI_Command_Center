// lib/auth.ts
import { createClient, SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!supabaseAnonKey) {
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
}

export type AuthenticatedRequest = {
  user: User;
  supabase: SupabaseClient;
  token: string;
};

function getAccessToken(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    return authHeader.slice("bearer ".length).trim();
  }

  const cookieToken = req.cookies.get("sb-access-token")?.value;
  if (cookieToken) {
    return cookieToken;
  }

  return null;
}

export async function authenticateRequest(
  req: NextRequest
): Promise<AuthenticatedRequest | { response: NextResponse }> {
  const token = getAccessToken(req);

  if (!token) {
    return {
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return {
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 })
    };
  }

  return { user: data.user, supabase, token };
}
