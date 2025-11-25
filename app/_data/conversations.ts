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
  leadEmail: string | null;
  leadPhone: string | null;
  leadProfession: string | null;
  locationName: string | null;
  locationCity: string | null;
  locationState: string | null;
}

export interface ConversationMessage {
  id: string;
  direction: "inbound" | "outbound" | null;
  channel: "sms" | "email" | "both" | null;
  content: string | null;
  deliveryStatus: string | null;
  sentAt: string | null;
}

export interface ConversationDetail {
  conversation: {
    id: string;
    status: string | null;
    stage: string | null;
    primaryChannel: string | null;
    intentScore: number | null;
    followUpAttempt: number | null;
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
    notes: string | null;
    aiSummary: string | null;
  };
  location: {
    id: string;
    name: string | null;
    city: string | null;
    state: string | null;
    schedulingLink: string | null;
    phoneNumber: string | null;
    emailAddress: string | null;
  };
  messages: ConversationMessage[];
}

interface ConversationRow {
  id: string;
  status: string | null;
  intent_score: number | null;
  follow_up_attempt: number | null;
  primary_channel: string | null;
  last_activity: string | null;
  leads: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    profession: string | null;
  } | null;
  locations: {
    id: string;
    name: string | null;
    city: string | null;
    state: string | null;
    corporate_account_id: string | null;
  } | null;
}

export async function getConversationsForCorporate(
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
      leads (
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

  const rows = (data as ConversationRow[] | null) ?? [];

  return rows.map((row) => ({
    id: row.id,
    status: row.status,
    primaryChannel: row.primary_channel,
    intentScore: row.intent_score,
    followUpAttempt: row.follow_up_attempt,
    lastActivity: row.last_activity,
    leadName: row.leads?.name ?? null,
    leadEmail: row.leads?.email ?? null,
    leadPhone: row.leads?.phone ?? null,
    leadProfession: row.leads?.profession ?? null,
    locationName: row.locations?.name ?? null,
    locationCity: row.locations?.city ?? null,
    locationState: row.locations?.state ?? null,
  }));
}

interface ConversationDetailRow {
  id: string;
  status: string | null;
  stage: string | null;
  primary_channel: string | null;
  intent_score: number | null;
  follow_up_attempt: number | null;
  last_activity: string | null;
  goal_progress: any;
  ai_context: any;
  leads: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    profession: string | null;
    lead_source: string | null;
    interested_service: string | null;
    notes: string | null;
    ai_summary: string | null;
  } | null;
  locations: {
    id: string;
    name: string | null;
    city: string | null;
    state: string | null;
    scheduling_link: string | null;
    phone_number: string | null;
    email_address: string | null;
    corporate_account_id: string | null;
  } | null;
}

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
      stage,
      primary_channel,
      intent_score,
      follow_up_attempt,
      last_activity,
      goal_progress,
      ai_context,
      leads (
        id,
        name,
        email,
        phone,
        profession,
        lead_source,
        interested_service,
        notes,
        ai_summary
      ),
      locations!inner (
        id,
        name,
        city,
        state,
        scheduling_link,
        phone_number,
        email_address,
        corporate_account_id
      )
    `
    )
    .eq("id", conversationId)
    .eq("locations.corporate_account_id", corporateAccountId)
    .single();

  if (error && error.code !== "PGRST116") throw error;
  if (!data) return null;

  const row = data as ConversationDetailRow;

  const { data: messagesData, error: msgError } = await supabaseAdmin
    .from("messages")
    .select(
      `
      id,
      direction,
      channel,
      content,
      delivery_status,
      sent_at
    `
    )
    .eq("conversation_id", conversationId)
    .order("sent_at", { ascending: true });

  if (msgError) throw msgError;

  const messages: ConversationMessage[] =
    (messagesData ?? []).map((m: any) => ({
      id: m.id,
      direction: m.direction,
      channel: m.channel,
      content: m.content,
      deliveryStatus: m.delivery_status,
      sentAt: m.sent_at,
    })) ?? [];

  return {
    conversation: {
      id: row.id,
      status: row.status,
      stage: row.stage,
      primaryChannel: row.primary_channel,
      intentScore: row.intent_score,
      followUpAttempt: row.follow_up_attempt,
      lastActivity: row.last_activity,
    },
    lead: {
      id: row.leads?.id ?? "",
      name: row.leads?.name ?? null,
      email: row.leads?.email ?? null,
      phone: row.leads?.phone ?? null,
      profession: row.leads?.profession ?? null,
      leadSource: row.leads?.lead_source ?? null,
      interestedService: row.leads?.interested_service ?? null,
      notes: row.leads?.notes ?? null,
      aiSummary: row.leads?.ai_summary ?? null,
    },
    location: {
      id: row.locations?.id ?? "",
      name: row.locations?.name ?? null,
      city: row.locations?.city ?? null,
      state: row.locations?.state ?? null,
      schedulingLink: row.locations?.scheduling_link ?? null,
      phoneNumber: row.locations?.phone_number ?? null,
      emailAddress: row.locations?.email_address ?? null,
    },
    messages,
  };
}
