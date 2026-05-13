import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { EventDetailView } from "./_event-detail-view";

export const dynamic = "force-dynamic";

export default async function CoupleEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/dashboard/demo`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/dashboard/login`);

  const svc = createSupabaseServiceClient();
  const { data: couple } = await svc
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!couple) redirect(`/${locale}/dashboard`);

  const { data: event } = await svc
    .from("events")
    .select(
      "id, title, wedding_date, status, expires_at, photos_count, videos_count, guests_count, brand_color, cover_image_path, tariff_code",
    )
    .eq("id", id)
    .eq("couple_id", couple.id)
    .maybeSingle();
  if (!event) notFound();

  let coverUrl: string | null = null;
  if (event.cover_image_path) {
    const { data } = await svc.storage
      .from("event-assets")
      .createSignedUrl(event.cover_image_path, 60 * 60);
    coverUrl = data?.signedUrl ?? null;
  }

  const { data: media } = await svc
    .from("media")
    .select("id, kind, storage_path, taken_at, status, is_highlight")
    .eq("event_id", event.id)
    .eq("kind", "photo")
    .order("taken_at", { ascending: false })
    .limit(120);

  const items = await Promise.all(
    (media ?? []).map(async (m, idx) => {
      const { data } = await svc.storage
        .from("event-photos")
        .createSignedUrl(m.storage_path, 60 * 60);
      return {
        id: m.id,
        kind: "photo" as const,
        url: data?.signedUrl ?? "",
        hue: (idx * 37) % 360,
        status: m.status as "ready" | "hidden" | "flagged",
        highlight: m.is_highlight,
      };
    }),
  );

  const { data: extensions } = await svc
    .from("storage_extensions")
    .select("id, extends_by_days, price_uzs, applied_at")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const highlightsCount = items.filter((i) => i.highlight).length;

  return (
    <EventDetailView
      event={{
        id: event.id,
        title: event.title,
        wedding_date: event.wedding_date,
        status: event.status,
        expires_at: event.expires_at,
        photos_count: event.photos_count,
        videos_count: event.videos_count,
        guests_count: event.guests_count,
        brand_color: event.brand_color,
        tariff_code: event.tariff_code,
        cover_url: coverUrl,
        highlights_count: highlightsCount,
      }}
      items={items.filter((i) => i.url)}
      extensions={extensions ?? []}
      basePath="/dashboard"
    />
  );
}
