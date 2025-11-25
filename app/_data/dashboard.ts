// app/_data/dashboard.ts
import { supabaseAdmin } from "@/lib/supabaseServer";

export interface HeroStats {
  totalLeads: number;
  activeConversations: number;
  responseRate: number;
  messagesInPeriod: number;
}

export interface PipelineStage {
  status: string;
  count: number;
  avgIntent: number;
}

export interface CadenceBucket {
  attempt: number;
  count: number;
}

export interface ChannelStats {
  totalMessages: number;
  deliveryRate: number;
  conversations: number;
  avgLength: number;
}

export interface DashboardData {
  hero: HeroStats;
  pipeline: PipelineStage[];
  cadence: CadenceBucket[];
  sms: ChannelStats;
  email: ChannelStats;
}

interface SupabaseConversation {
  id: string;
  status: string | null;
  intent_score: number | null;
  follow_up_attempt: number | null;
  last_activity: string | null;
  location_id: string | null;
}

interface SupabaseMessage {
  id: string;
  conversation_id: string;
  channel: "sms" | "email" | "both" | null;
  direction: "inbound" | "outbound" | null;
  content: string | null;
  delivery_status: "sent" | "delivered" | "failed" | "bounced" | null;
  sent_at: string | null;
}

interface SupabaseLead {
  id: string;
  location_id: string | null;
  created_at?: string;
}

export async function getDashboardData(
  corporateAccountId: string
): Promise<DashboardData> {
  // ALL-TIME LEADS FOR THIS CORPORATE
  const { data: leads, error: leadsError } = await supabaseAdmin
    .from("leads")
    .select(
      `
      id,
      created_at,
      locations!inner (
        corporate_account_id
      )
    `
    )
    .eq("locations.corporate_account_id", corporateAccountId);

  if (leadsError) throw leadsError;
  const totalLeads = (leads as SupabaseLead[] | null)?.length ?? 0;

  // ALL-TIME CONVERSATIONS FOR THIS CORPORATE
  const { data: conversations, error: convError } = await supabaseAdmin
    .from("conversations")
    .select(
      `
      id,
      status,
      intent_score,
      follow_up_attempt,
      last_activity,
      location_id,
      locations!inner (
        corporate_account_id
      )
    `
    )
    .eq("locations.corporate_account_id", corporateAccountId);

  if (convError) throw convError;
  const convList = (conversations as SupabaseConversation[] | null) ?? [];

  const activeConversations = convList.filter(
    c => c.status === "active"
  ).length;

  // ALL-TIME MESSAGES FOR THIS CORPORATE
  const { data: messages, error: msgError } = await supabaseAdmin
    .from("messages")
    .select(
      `
      id,
      conversation_id,
      channel,
      direction,
      content,
      delivery_status,
      sent_at,
      conversations!inner (
        location_id,
        locations!inner (
          corporate_account_id
        )
      )
    `
    )
    .eq("conversations.locations.corporate_account_id", corporateAccountId);

  if (msgError) throw msgError;
  const msgList = (messages as SupabaseMessage[] | null) ?? [];

  // RESPONSE RATE: active conversations with ≥1 inbound message
  const activeIds = new Set(
    convList.filter(c => c.status === "active").map(c => c.id)
  );
  const inboundByConversation = new Set(
    msgList
      .filter(m => m.direction === "inbound")
      .map(m => m.conversation_id)
  );

  let respondedActive = 0;
  for (const id of activeIds) {
    if (inboundByConversation.has(id)) respondedActive++;
  }

  const responseRate =
    activeIds.size === 0 ? 0 : Math.round((respondedActive / activeIds.size) * 100);

  // PIPELINE
  const pipelineBuckets = new Map<
    string,
    { count: number; intentTotal: number; withIntent: number }
  >();

  for (const c of convList) {
    const status = c.status ?? "unknown";
    if (!pipelineBuckets.has(status)) {
      pipelineBuckets.set(status, { count: 0, intentTotal: 0, withIntent: 0 });
    }
    const bucket = pipelineBuckets.get(status)!;
    bucket.count++;
    if (typeof c.intent_score === "number") {
      bucket.intentTotal += c.intent_score;
      bucket.withIntent++;
    }
  }

  const pipeline: PipelineStage[] = Array.from(pipelineBuckets.entries()).map(
    ([status, bucket]) => ({
      status,
      count: bucket.count,
      avgIntent:
        bucket.withIntent === 0
          ? 0
          : Math.round(bucket.intentTotal / bucket.withIntent)
    })
  );

  // CADENCE
  const cadenceMap: Map<number, number> = new Map();
  for (const c of convList) {
    const attempt = c.follow_up_attempt ?? 0;
    cadenceMap.set(attempt, (cadenceMap.get(attempt) ?? 0) + 1);
  }

  const maxAttempt = Math.max(6, ...Array.from(cadenceMap.keys()));
  const cadence: CadenceBucket[] = [];
  for (let i = 0; i <= maxAttempt; i++) {
    cadence.push({ attempt: i, count: cadenceMap.get(i) ?? 0 });
  }

  // CHANNEL STATS
  function buildChannelStats(channelKey: "sms" | "email"): ChannelStats {
    const filtered = msgList.filter(
      m => m.channel === channelKey || m.channel === "both"
    );
    const totalMessages = filtered.length;
    const delivered = filtered.filter(m => m.delivery_status === "delivered").length;
    const convIds = new Set(filtered.map(m => m.conversation_id));
    const totalLen = filtered.reduce(
      (sum, m) => sum + (m.content?.length ?? 0),
      0
    );

    return {
      totalMessages,
      deliveryRate:
        totalMessages === 0 ? 0 : Math.round((delivered / totalMessages) * 100),
      conversations: convIds.size,
      avgLength:
        totalMessages === 0 ? 0 : Math.round(totalLen / totalMessages)
    };
  }

  const sms = buildChannelStats("sms");
  const email = buildChannelStats("email");

  return {
    hero: {
      totalLeads,
      activeConversations,
      responseRate,
      messagesInPeriod: msgList.length
    },
    pipeline,
    cadence,
    sms,
    email
  };
}
