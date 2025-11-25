// app/_data/conversations.ts
import { supabaseAdmin } from "@/lib/supabaseServer";

export interface ConversationListItem {
  id: string;
  status: string | null;
  primaryChannel: string | null;
  intentScore: number | null;
  followUpAttempt: number | null;
  lastActivity: string | null;
  leadName: string | null;
  leadProfession: string | null;
  leadEmail: string | null;
  locationName: string | null;
  locationCity: string | null;
  locationState: string | null;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    status: string | null;
    intentScore: number | null;
    followUpAttempt: number | null;
    primaryChannel: string | null;
    lastActivity: string | null;
  };
  lead: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    profession: string | null;
    leadSource: string | null;
    interestedService: string | null;
    aiSummary: string | null;
    notes: string | null;
  };
  location: {
    id: string;
    name: string | null;
    city: string | null;
    state: string | null;
  };
  messages: {
    id: string;
    direction: "inbound" | "outbound" | null;
    sentAt: string | null;
    content: string | null;
  }[];
}

// List view – last 50 conversations for a corporate account
export async function getConversationList(
  corporateAccountId: string
): Promise<ConversationListItem[]> {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(
      `
      id,
      status,
      intent_score,
      follow_up_attempt,
      primary_channel,
      last_activity,
      leads!inner (
        id,
        name,
        email,
        phone,
        profession
      ),
      locations!inner (
        id,
        name,
        city,
        state,
        corporate_account_id
      )
    `
    )
    .eq("locations.corporate_account_id", corporateAccountId)
    .order("last_activity", { ascending: false })
    .limit(50);

  if (error) throw error;

  // Supabase returns nested relations as arrays; treat them as any
  const rows = (data ?? []) as any[];

  return rows.map((row): ConversationListItem => {
    const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads ?? {};
    const location = Array.isArray(row.locations)
      ? row.locations[0]
      : row.locations ?? {};

    return {
      id: row.id as string,
      status: (row.status as string) ?? null,
      primaryChannel: (row.primary_channel as string) ?? null,
      intentScore:
        typeof row.intent_score === "number" ? row.intent_score : null,
      followUpAttempt:
        typeof row.follow_up_attempt === "number"
          ? row.follow_up_attempt
          : null,
      lastActivity: (row.last_activity as string) ?? null,
      leadName: (lead?.name as string) ?? null,
      leadProfession: (lead?.profession as string) ?? null,
      leadEmail: (lead?.email as string) ?? null,
      locationName: (location?.name as string) ?? null,
      locationCity: (location?.city as string) ?? null,
      locationState: (location?.state as string) ?? null,
    };
  });
}

// Detail view – single conversation + lead + location + messages
export async function getConversationDetail(
  corporateAccountId: string,
  conversationId: string
): Promise<ConversationDetail | null> {
  const { data, error } = await supabaseAdmin
    .from("conversations")
    .select(
      `
      id,
      status,
      intent_score,
      follow_up_attempt,
      primary_channel,
      last_activity,
      leads!inner (
        id,
        name,
        email,
        phone,
        profession,
        lead_source,
        interested_service,
        ai_summary,
        notes
      ),
      locations!inner (
        id,
        name,
        city,
        state,
        corporate_account_id
      ),
      messages (
        id,
        direction,
        content,
        sent_at
      )
    `
    )
    .eq("id", conversationId)
    .eq("locations.corporate_account_id", corporateAccountId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const row = data as any;
  const lead = Array.isArray(row.leads) ? row.leads[0] : row.leads ?? {};
  const location = Array.isArray(row.locations)
    ? row.locations[0]
    : row.locations ?? {};
  const messagesArray = (row.messages ?? []) as any[];

  return {
    conversation: {
      id: row.id as string,
      status: (row.status as string) ?? null,
      intentScore:
        typeof row.intent_score === "number" ? row.intent_score : null,
      followUpAttempt:
        typeof row.follow_up_attempt === "number"
          ? row.follow_up_attempt
          : null,
      primaryChannel: (row.primary_channel as string) ?? null,
      lastActivity: (row.last_activity as string) ?? null,
    },
    lead: {
      id: (lead?.id as string) ?? "",
      name: (lead?.name as string) ?? null,
      email: (lead?.email as string) ?? null,
      phone: (lead?.phone as string) ?? null,
      profession: (lead?.profession as string) ?? null,
      leadSource: (lead?.lead_source as string) ?? null,
      interestedService: (lead?.interested_service as string) ?? null,
      aiSummary: (lead?.ai_summary as string) ?? null,
      notes: (lead?.notes as string) ?? null,
    },
    location: {
      id: (location?.id as string) ?? "",
      name: (location?.name as string) ?? null,
      city: (location?.city as string) ?? null,
      state: (location?.state as string) ?? null,
    },
    messages: messagesArray.map(
      (m): ConversationDetail["messages"][number] => ({
        id: m.id as string,
        direction: (m.direction as "inbound" | "outbound" | null) ?? null,
        sentAt: (m.sent_at as string) ?? null,
        content: (m.content as string) ?? null,
      })
    ),
  };
}
