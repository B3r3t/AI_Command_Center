// app/page.tsx
import { getDashboardData } from "./_data/dashboard";
import {
  getConversationsForCorporate,
  getConversationDetail,
} from "./_data/conversations";
import { ConversationsSection } from "./components/ConversationsSection";

export default async function DashboardPage() {
  const corporateId = process.env.CORPORATE_ACCOUNT_ID;

  if (!corporateId) {
    throw new Error("CORPORATE_ACCOUNT_ID environment variable is not set");
  }

  const [dashboard, conversations] = await Promise.all([
    getDashboardData(corporateId),
    getConversationsForCorporate(corporateId),
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
