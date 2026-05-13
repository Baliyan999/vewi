import { setRequestLocale } from "next-intl/server";
import { DashboardView, type ActivityRow } from "@/components/couple/dashboard-view";
import { DEMO_EVENT_DETAIL, DEMO_GUESTS } from "@/lib/demo-data";

export default async function DemoDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Top 6 most-active guests for the Recent Activity feed
  const activity: ActivityRow[] = DEMO_GUESTS
    .slice()
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
    .map((g, idx) => ({
      name: g.display_name ?? "Гость",
      table: `Table ${idx + 1}`,
      delta: g.count,
      active: idx < 3,
    }));

  return (
    <DashboardView
      event={DEMO_EVENT_DETAIL}
      guestsTotal={DEMO_GUESTS.length}
      tablesTotal={15}
      tablesActive={12}
      activity={activity}
      basePath="/dashboard/demo"
    />
  );
}
