import { setRequestLocale } from "next-intl/server";
import { DashboardView, type ActivityRow } from "@/components/couple/dashboard-view";
import { DEMO_EVENT_DETAIL, DEMO_GUESTS } from "@/lib/demo-data";

const TABLES = ["Стол 3", "Стол 1", "Стол 5", "Стол 7", "Стол 2", "Стол 4"];

function shortenName(full: string | null): string {
  if (!full) return "Гость";
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0].toUpperCase()}.`;
}

export default async function DemoDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Top 6 most-active guests for the activity feed
  const activity: ActivityRow[] = DEMO_GUESTS
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((g, idx) => ({
      name: shortenName(g.display_name),
      table: TABLES[idx] ?? `Стол ${idx + 1}`,
      delta: g.count,
      active: idx < 3,
    }));

  return (
    <DashboardView
      event={{
        id: DEMO_EVENT_DETAIL.id,
        title: "Alina & Rustam",
        status: "active",
        photos_count: 147,
        guests_count: 23,
      }}
      tablesTotal={8}
      activity={activity}
      basePath="/dashboard/demo"
    />
  );
}
