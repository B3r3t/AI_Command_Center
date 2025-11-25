// lib/dateRange.ts
export type RangeKey = "7d" | "30d" | "90d";

export function getDateRange(range: RangeKey) {
  const to = new Date();
  const from = new Date();

  if (range === "7d") from.setDate(to.getDate() - 7);
  if (range === "30d") from.setDate(to.getDate() - 30);
  if (range === "90d") from.setDate(to.getDate() - 90);

  return {
    from: from.toISOString(),
    to: to.toISOString()
  };
}
