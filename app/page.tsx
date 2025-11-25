// app/page.tsx
import fs from "fs";
import path from "path";
import { DashboardHydrator } from "./DashboardHydrator";
import type { RangeKey } from "@/lib/dateRange";

export const dynamic = "force-dynamic";

function getTemplateBody() {
  const filePath = path.join(process.cwd(), "public", "dashboard.html");
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1] : raw;
}

const templateBody = getTemplateBody();

export default function Page({
  searchParams
}: {
  searchParams: { range?: RangeKey };
}) {
  const range: RangeKey = searchParams.range ?? "7d";

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: templateBody }} />
      <DashboardHydrator />
    </>
  );
}
