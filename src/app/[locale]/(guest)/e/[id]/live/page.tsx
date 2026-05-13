import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { LiveSlideshow } from "./_live-slideshow";

export const dynamic = "force-dynamic";

export default async function LivePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (id === "demo") {
    return (
      <LiveSlideshow
        eventId="demo"
        title="Алишер и Дильноза"
        brandColor="#c89c66"
        initialUrls={[]}
      />
    );
  }

  const svc = createSupabaseServiceClient();
  const { data: event } = await svc
    .from("events")
    .select("id, title, brand_color, short_code")
    .or(`id.eq.${id},short_code.eq.${id}`)
    .maybeSingle();
  if (!event) notFound();

  const { data: recent } = await svc
    .from("media")
    .select("storage_path, created_at")
    .eq("event_id", event.id)
    .eq("kind", "photo")
    .eq("status", "ready")
    .order("created_at", { ascending: false })
    .limit(40);

  const urls = await Promise.all(
    (recent ?? []).map(async (m) => {
      const { data } = await svc.storage
        .from("event-photos")
        .createSignedUrl(m.storage_path, 60 * 60 * 12);
      return data?.signedUrl ?? null;
    }),
  );

  return (
    <LiveSlideshow
      eventId={event.id}
      title={event.title}
      brandColor={event.brand_color}
      initialUrls={urls.filter((u): u is string => Boolean(u))}
    />
  );
}
