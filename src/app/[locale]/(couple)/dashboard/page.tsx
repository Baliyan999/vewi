import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { EmptyState } from "@/components/couple/empty-state";
import { DashboardView, type ActivityRow } from "@/components/couple/dashboard-view";

export const dynamic = "force-dynamic";

export default async function CoupleDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Без настроенного Supabase мягко переводим в demo-режим
  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/dashboard/demo`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/dashboard/login`);

  const svc = createSupabaseServiceClient();
  const { data: couple } = await svc
    .from("couples")
    .select("id, bride_name, groom_name, telegram_chat_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const t = await getTranslations({ locale, namespace: "couple" });

  if (!couple) {
    return (
      <EmptyState
        title={t("empty.title")}
        desc={t("empty.desc")}
        brideName="—"
        groomName="—"
      />
    );
  }

  // Active event = most recent active, else most recent any
  const { data: rows } = await svc
    .from("events")
    .select(
      "id, title, wedding_date, status, photos_count, videos_count, guests_count",
    )
    .eq("couple_id", couple.id)
    .order("wedding_date", { ascending: false });

  const event = (rows ?? []).find((e) => e.status === "active") ?? (rows ?? [])[0];

  if (!event) {
    return (
      <EmptyState
        title={t("empty.title")}
        desc={t("empty.desc")}
        brideName={couple.bride_name}
        groomName={couple.groom_name}
      />
    );
  }

  // Activity feed — top contributors by photo count
  const { data: guestRows } = await svc
    .from("guests")
    .select("id, display_name, photos_taken, last_seen_at")
    .eq("event_id", event.id)
    .order("photos_taken", { ascending: false })
    .limit(6);

  const now = Date.now();
  const activity: ActivityRow[] = (guestRows ?? []).map((g, idx) => ({
    name: g.display_name ?? "Гость",
    table: `Table ${idx + 1}`,
    delta: g.photos_taken,
    active: g.last_seen_at
      ? now - new Date(g.last_seen_at).getTime() < 5 * 60_000
      : false,
  }));

  return (
    <DashboardView
      event={event}
      guestsTotal={event.guests_count || activity.length}
      tablesTotal={15}
      tablesActive={Math.min(15, activity.filter((a) => a.active).length + 5)}
      activity={activity}
      basePath="/dashboard"
    />
  );
}
