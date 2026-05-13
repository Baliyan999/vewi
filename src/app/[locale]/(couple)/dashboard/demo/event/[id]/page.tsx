import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EventDetailView } from "@/app/[locale]/(couple)/dashboard/event/[id]/_event-detail-view";
import { DEMO_EVENT_DETAIL } from "@/lib/demo-data";

export default async function DemoEvent({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (id !== DEMO_EVENT_DETAIL.id) notFound();

  return (
    <EventDetailView
      event={{
        id: DEMO_EVENT_DETAIL.id,
        title: DEMO_EVENT_DETAIL.title,
        wedding_date: DEMO_EVENT_DETAIL.wedding_date,
        status: DEMO_EVENT_DETAIL.status,
        expires_at: DEMO_EVENT_DETAIL.expires_at,
        photos_count: DEMO_EVENT_DETAIL.photos_count,
        videos_count: DEMO_EVENT_DETAIL.videos_count,
        guests_count: DEMO_EVENT_DETAIL.guests_count,
        highlights_count: DEMO_EVENT_DETAIL.highlights_count,
        brand_color: DEMO_EVENT_DETAIL.brand_color,
        tariff_code: DEMO_EVENT_DETAIL.tariff_code,
        cover_url: null,
      }}
      items={DEMO_EVENT_DETAIL.items.map((i) => ({
        id: i.id,
        kind: i.kind,
        url: "",
        hue: i.hue,
        status: i.status,
        highlight: i.highlight,
        guest_id: i.guest_id,
        guest_name: i.guest_name,
      }))}
      extensions={[]}
      basePath="/dashboard/demo"
      demo
    />
  );
}
