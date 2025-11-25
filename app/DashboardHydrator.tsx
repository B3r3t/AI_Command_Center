// app/DashboardHydrator.tsx
"use client";

import { useEffect } from "react";

export function DashboardHydrator() {
  useEffect(() => {
    async function run() {
      try {
        const res = await fetch("/api/dashboard");
        if (!res.ok) return;

        const data = await res.json();

        const hero = data.hero as {
          totalLeads: number;
          activeConversations: number;
          responseRate: number;
          messagesInPeriod: number;
        };

        const mapping: [string, string][] = [
          ["totalLeadsValue", hero.totalLeads.toLocaleString()],
          ["activeConversationsValue", hero.activeConversations.toLocaleString()],
          ["responseRateValue", `${hero.responseRate}%`],
          ["messagesTodayValue", hero.messagesInPeriod.toLocaleString()]
        ];

        for (const [id, value] of mapping) {
          const el = document.getElementById(id);
          if (el) {
            el.textContent = value;
          }
        }
      } catch (err) {
        console.error("Failed to hydrate dashboard", err);
      }
    }

    run();
  }, []);

  return null;
}
