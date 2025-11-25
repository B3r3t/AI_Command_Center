// app/components/ConversationsSection.tsx
"use client";

import { useMemo, useState } from "react";
import type {
  ConversationListItem,
  ConversationDetail,
} from "@/app/_data/conversations";

interface ConversationsSectionProps {
  initialConversations: ConversationListItem[];
  initialDetail: ConversationDetail | null;
}

function formatRelativeTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.round(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;

  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours} hr${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

const statusLabel: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  dormant: "Dormant",
  handed_off: "Handed Off",
};

const statusClass: Record<string, string> = {
  active: "status-badge status-active",
  completed: "status-badge status-completed",
  dormant: "status-badge status-dormant",
  handed_off: "status-badge status-handed-off",
};

const channelClass: Record<string, string> = {
  sms: "channel-badge channel-sms",
  email: "channel-badge channel-email",
  both: "channel-badge channel-both",
};

export function ConversationsSection({
  initialConversations,
  initialDetail,
}: ConversationsSectionProps) {
  const [conversations] = useState<ConversationListItem[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(
    initialDetail?.conversation.id ?? initialConversations[0]?.id ?? null
  );
  const [detail, setDetail] = useState<ConversationDetail | null>(initialDetail);
  const [loading, setLoading] = useState(false);

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? conversations[0],
    [conversations, selectedId]
  );

  const handleSelect = async (id: string) => {
    if (id === selectedId) return;
    setSelectedId(id);
    setLoading(true);

    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("Failed to load conversation");
      const data = (await res.json()) as ConversationDetail;
      setDetail(data);
    } catch (err) {
      console.error("Error loading conversation detail", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="two-column-row" style={{ marginTop: "2.5rem" }}>
      {/* LEFT: Conversation list */}
      <div className="premium-card animate-in" style={{ flex: "1.6 1 0" }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">Conversations</h2>
            <p className="card-subtitle">
              Live view of leads across all IMAGE Studios locations.
            </p>
          </div>
        </div>

        <table className="conversations-table">
          <thead>
            <tr>
              <th>Lead</th>
              <th>Location</th>
              <th>Status</th>
              <th>Channel</th>
              <th>Intent</th>
              <th>Attempt</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {conversations.map((c) => {
              const isSelected = c.id === selectedId;
              const s = (c.status ?? "").toLowerCase();
              const ch = (c.primaryChannel ?? "").toLowerCase();

              return (
                <tr
                  key={c.id}
                  className={`clickable ${isSelected ? "row-selected" : ""}`}
                  onClick={() => handleSelect(c.id)}
                >
                  <td>
                    <div className="table-primary">
                      {c.leadName ?? "Unknown lead"}
                    </div>
                    <div className="table-secondary">
                      {c.leadProfession ?? ""}
                      {c.leadEmail ? ` • ${c.leadEmail}` : ""}
                    </div>
                  </td>
                  <td>
                    <div className="table-primary">
                      {c.locationName ?? "Unknown location"}
                    </div>
                    <div className="table-secondary">
                      {[c.locationCity, c.locationState]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                  </td>
                  <td>
                    <span
                      className={
                        statusClass[s] ?? "status-badge status-default"
                      }
                    >
                      {statusLabel[s] ?? c.status ?? "Unknown"}
                    </span>
                  </td>
                  <td>
                    <span
                      className={
                        channelClass[ch] ?? "channel-badge channel-default"
                      }
                    >
                      {ch ? ch.toUpperCase() : "N/A"}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{
                        fontWeight: 600,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {c.intentScore ?? "–"}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontVariantNumeric: "tabular-nums" }}>
                      {c.followUpAttempt ?? 0}
                    </div>
                  </td>
                  <td>
                    <div className="table-secondary">
                      {formatRelativeTime(c.lastActivity)}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RIGHT: Lead profile + messages + health */}
      <div
        className="conversation-detail-grid"
        style={{
          flex: "2.4 1 0",
          display: "grid",
          gridTemplateColumns: "minmax(0, 0.95fr) minmax(0, 1.6fr)",
          gridTemplateRows: "auto auto",
          gap: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Lead Profile */}
        <div className="premium-card" style={{ gridRow: "1 / span 2" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Lead Profile
          </h3>

          {detail ? (
            <>
              <div style={{ marginBottom: "1.25rem" }}>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "0.25rem",
                  }}
                >
                  {detail.lead.name ?? "Unknown lead"}
                </div>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  {detail.lead.profession}
                </div>
              </div>

              <div className="profile-field">
                <div className="profile-label">Location</div>
                <div className="profile-value">
                  {detail.location.name}
                  <div className="profile-sub">
                    {[detail.location.city, detail.location.state]
                      .filter(Boolean)
                      .join(", ")}
                  </div>
                </div>
              </div>

              <div className="profile-field">
                <div className="profile-label">Phone</div>
                <div className="profile-value">{detail.lead.phone}</div>
              </div>

              <div className="profile-field">
                <div className="profile-label">Email</div>
                <div className="profile-value">{detail.lead.email}</div>
              </div>

              <div className="profile-field">
                <div className="profile-label">Lead Source</div>
                <div className="profile-value">
                  {detail.lead.leadSource ?? "Unknown"}
                </div>
              </div>

              <div className="profile-field">
                <div className="profile-label">Interest</div>
                <div className="profile-value">
                  {detail.lead.interestedService ?? "Not captured"}
                </div>
              </div>

              {detail.lead.aiSummary && (
                <div className="profile-field">
                  <div className="profile-label">AI Summary</div>
                  <div className="profile-note">{detail.lead.aiSummary}</div>
                </div>
              )}

              {detail.lead.notes && (
                <div className="profile-field">
                  <div className="profile-label">Notes</div>
                  <div className="profile-note">{detail.lead.notes}</div>
                </div>
              )}
            </>
          ) : (
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Select a conversation to view lead details.
            </p>
          )}
        </div>

        {/* Conversation History */}
        <div
          className="premium-card"
          style={{ minHeight: 400, gridColumn: "2 / 3" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700 }}>
              Conversation History
            </h3>
            {loading && (
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-tertiary)",
                }}
              >
                Loading…
              </span>
            )}
          </div>

          <div className="message-thread">
            {detail && detail.messages.length > 0 ? (
              detail.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${
                    msg.direction === "inbound" ? "inbound" : "outbound"
                  }`}
                >
                  <div className="message-avatar" />
                  <div className="message-bubble">
                    <div className="message-meta">
                      <span className="message-author">
                        {msg.direction === "outbound"
                          ? "AGNT"
                          : detail.lead.name ?? "Lead"}
                      </span>
                      <span className="message-time">
                        {msg.sentAt
                          ? new Date(msg.sentAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="message-text">{msg.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                }}
              >
                No messages yet for this conversation.
              </p>
            )}
          </div>
        </div>

        {/* Conversation Health */}
        <div className="premium-card" style={{ gridColumn: "2 / 3" }}>
          <h3
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginBottom: "1rem",
            }}
          >
            Conversation Health
          </h3>

          {detail ? (
            <div className="insight-grid">
              <div className="insight-item">
                <div className="insight-label">Status</div>
                <div className="insight-value">
                  {statusLabel[
                    (detail.conversation.status ?? "").toLowerCase()
                  ] ??
                    detail.conversation.status ??
                    "Unknown"}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Intent Score</div>
                <div className="insight-value">
                  {detail.conversation.intentScore ?? "–"}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Follow-up Attempt</div>
                <div className="insight-value">
                  {detail.conversation.followUpAttempt ?? 0}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Primary Channel</div>
                <div className="insight-value">
                  {detail.conversation.primaryChannel?.toUpperCase() ?? "N/A"}
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-label">Last Activity</div>
                <div className="insight-value">
                  {formatRelativeTime(detail.conversation.lastActivity)}
                </div>
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
              }}
            >
              Select a conversation to view AI signals and status.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default ConversationsSection;
