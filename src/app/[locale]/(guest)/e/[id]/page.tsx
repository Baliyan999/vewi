import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { GuestApp } from "./_guest-app";
import type { EventRow, Tariff } from "@/lib/db/types";

async function loadEvent(idOrSlug: string): Promise<
  | { event: EventRow; tariff: Tariff; ok: true }
  | { ok: false; reason: "not_found" | "not_active" | "expired" }
> {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("events")
    .select("*, tariffs(*)")
    .or(`id.eq.${idOrSlug},short_code.eq.${idOrSlug}`)
    .maybeSingle();

  if (error || !data) return { ok: false, reason: "not_found" };

  const now = Date.now();
  const event = data as EventRow & { tariffs: Tariff };
  if (new Date(event.expires_at).getTime() < now) {
    return { ok: false, reason: "expired" };
  }
  if (
    new Date(event.active_from).getTime() > now ||
    new Date(event.active_to).getTime() < now
  ) {
    return { ok: false, reason: "not_active" };
  }

  const { tariffs: tariff, ...rest } = event;
  return { ok: true, event: rest as EventRow, tariff };
}

export default async function GuestEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  // In dev, allow a special demo id to view UI without DB
  if (id === "demo") {
    return (
      <GuestApp
        event={{
          id: "demo",
          title: "Алишер и Дильноза",
          wedding_date: "2026-06-12",
          brand_color: "#c89c66",
          cover_image_path: null,
          photos_per_guest: 20,
          videos_per_guest: 5,
          videos_enabled: true,
          geofence_enabled: false,
          venue_lat: null,
          venue_lng: null,
          venue_radius_m: 500,
        }}
      />
    );
  }

  if (!isSupabaseConfigured()) {
    // Без БД любые id, кроме "demo", дают 404 — а гость с QR-кода
    // должен получить хотя бы пустую заглушку
    notFound();
  }

  const res = await loadEvent(id);
  if (!res.ok) {
    if (res.reason === "not_found") notFound();
    return (
      <GuestApp
        event={null}
        unavailableReason={res.reason}
      />
    );
  }

  return (
    <GuestApp
      event={{
        id: res.event.id,
        title: res.event.title,
        wedding_date: res.event.wedding_date,
        brand_color: res.event.brand_color,
        cover_image_path: res.event.cover_image_path,
        photos_per_guest: res.tariff.photos_per_guest,
        videos_per_guest: res.tariff.videos_per_guest,
        videos_enabled: res.tariff.videos_per_guest > 0,
        geofence_enabled: res.event.geofence_enabled,
        venue_lat: res.event.venue_lat,
        venue_lng: res.event.venue_lng,
        venue_radius_m: res.event.venue_radius_m,
      }}
    />
  );
}
