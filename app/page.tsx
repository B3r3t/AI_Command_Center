// app/page.tsx
import { getDashboardData } from "./_data/dashboard";
import { getConversationDetail, getConversationList } from "./_data/conversations";
import { ConversationsSection } from "./components/ConversationsSection";

export default async function DashboardPage() {
  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    throw new Error("CORPORATE_ACCOUNT_ID environment variable is not set");
  }

  const [dashboard, conversations] = await Promise.all([
    getDashboardData(corporateId),
    getConversationList(corporateId),
  ]);

  const initialDetail =
    conversations.length > 0
      ? await getConversationDetail(corporateId, conversations[0].id)
      : null;

  const { hero, pipeline, sms, email, cadence } = dashboard;

  return (
    <div className="app-shell">
      {/* HEADER */}
      <header className="app-header">
        <div className="app-header-left">
          <div className="brand-mark">AGNTMKT</div>
          <div className="header-title-block">
            <h1 className="header-title">AI Command Center</h1>
            <p className="header-subtitle">
              IMAGE Studios – Conversation Performance
            </p>
          </div>
        </div>
        <div className="app-header-right">
          <div className="header-pill">All Locations (IMAGE Studios)</div>
        </div>
      </header>

      {/* BODY: sidebar + main */}
      <div className="app-body">
        {/* SIDEBAR */}
        <aside className="sidebar">
          <nav className="sidebar-nav">
            <div className="sidebar-section-label">Overview</div>
            <button className="sidebar-item sidebar-item-active">
              <span className="sidebar-dot sidebar-dot-orange" />
              Conversations
            </button>
            <button className="sidebar-item" disabled>
              <span className="sidebar-dot" />
              Lead Quality
            </button>
            <button className="sidebar-item" disabled>
              <span className="sidebar-dot" />
              Agent Behavior
            </button>

            <div className="sidebar-section-label">Settings</div>
            <button className="sidebar-item" disabled>
              <span className="sidebar-dot" />
              Locations
            </button>
            <button className="sidebar-item" disabled>
              <span className="sidebar-dot" />
              Templates
            </button>
          </nav>
        </aside>

        {/* MAIN PANEL */}
        <main className="main-panel">
          {/* HERO ROW */}
          <section className="hero-grid">
            {/* Total Leads */}
            <div className="premium-card hero-card animate-in animate-delay-1">
              <div className="hero-label-row">
                <div className="stat-label">Total Leads</div>
              </div>
              <div className="hero-number">
                {hero.totalLeads.toLocaleString()}
              </div>
              <div className="stat-delta">
                <span>All time · IMAGE Studios</span>
              </div>
            </div>

            {/* Active Conversations */}
            <div className="premium-card hero-card animate-in animate-delay-2">
              <div className="hero-label-row">
                <div className="stat-label">Active</div>
              </div>
              <div className="hero-number">
                {hero.activeConversations.toLocaleString()}
              </div>
              <div className="stat-delta">
                <span>Currently nurtured</span>
              </div>
            </div>

            {/* Response Rate */}
            <div className="premium-card hero-card animate-in animate-delay-3">
              <div className="hero-label-row">
                <div className="stat-label">Response Rate</div>
              </div>
              <div className="hero-number">{hero.responseRate}%</div>
              <div className="stat-delta">
                <span>Leads who replied at least once</span>
              </div>
            </div>

            {/* Messages */}
            <div className="premium-card hero-card animate-in animate-delay-4">
              <div className="hero-label-row">
                <div className="stat-label">Total Messages</div>
              </div>
              <div className="hero-number">
                {hero.messagesInPeriod.toLocaleString()}
              </div>
              <div className="stat-delta">
                <span>
                  SMS {sms.totalMessages} • Email {email.totalMessages}
                </span>
              </div>
            </div>
          </section>

          {/* PIPELINE / CADENCE (summary – can expand later) */}
          <section className="two-column-row">
            <div className="premium-card animate-in">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Conversation Pipeline</h2>
                  <p className="card-subtitle">
                    Distribution by status and average AI intent.
                  </p>
                </div>
              </div>
              <div className="progress-stack">
                {pipeline.map((stage) => (
                  <div className="progress-item" key={stage.status}>
                    <div className="progress-label-group">
                      <span className="progress-indicator" />
                      <span style={{ fontWeight: 500 }}>{stage.status}</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width:
                            hero.activeConversations + hero.totalLeads > 0
                              ? `${Math.min(
                                  100,
                                  (stage.count /
                                    Math.max(
                                      1,
                                      pipeline.reduce(
                                        (sum, s) => sum + s.count,
                                        0
                                      )
                                    )) *
                                    100
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <div className="progress-value">
                      {stage.count.toLocaleString()}
                    </div>
                    <div className="progress-meta">
                      Intent: {stage.avgIntent}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="premium-card animate-in animate-delay-2">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Follow-Up Cadence</h2>
                  <p className="card-subtitle">
                    Number of conversations at each follow-up attempt.
                  </p>
                </div>
              </div>
              <div className="cadence-grid">
                {cadence.map((bucket) => (
                  <div className="cadence-cell" key={bucket.attempt}>
                    <div className="cadence-label">
                      {bucket.attempt === 0
                        ? "Welcome"
                        : `Attempt ${bucket.attempt}`}
                    </div>
                    <div className="cadence-count">
                      {bucket.count.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CONVERSATIONS: LIST + DETAIL (MOST IMPORTANT PART) */}
          <ConversationsSection
            initialConversations={conversations}
            initialDetail={initialDetail}
          />
        </main>
      </div>
    </div>
  );
}
