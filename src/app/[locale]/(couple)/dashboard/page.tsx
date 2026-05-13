import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Greeting } from "@/components/couple/greeting";
import { EventCard, type EventCardData } from "@/components/couple/event-card";
import { TelegramCard } from "@/components/couple/telegram-card";
import { EmptyState } from "@/components/couple/empty-state";

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

  const { data: rows } = await svc
    .from("events")
    .select(
      "id, title, wedding_date, status, expires_at, photos_count, videos_count, guests_count, brand_color, cover_image_path, tariff_code",
    )
    .eq("couple_id", couple.id)
    .order("wedding_date", { ascending: false });

  const events: EventCardData[] = await Promise.all(
    (rows ?? []).map(async (e) => {
      let coverUrl: string | null = null;
      if (e.cover_image_path) {
        const { data } = await svc.storage
          .from("event-assets")
          .createSignedUrl(e.cover_image_path, 60 * 60);
        coverUrl = data?.signedUrl ?? null;
      }
      return {
        id: e.id,
        title: e.title,
        wedding_date: e.wedding_date,
        status: e.status,
        expires_at: e.expires_at,
        photos_count: e.photos_count,
        videos_count: e.videos_count,
        guests_count: e.guests_count,
        brand_color: e.brand_color,
        tariff_code: e.tariff_code,
        cover_url: coverUrl,
      };
    }),
  );

  const nextWedding = events.find((e) => e.status === "active" || e.status === "draft");

  return (
    <DashboardContent
      brideName={couple.bride_name}
      groomName={couple.groom_name}
      events={events}
      nextWeddingDate={nextWedding?.wedding_date ?? null}
      telegramLinked={Boolean(couple.telegram_chat_id)}
      basePath="/dashboard"
    />
  );
}

function DashboardContent({
  brideName,
  groomName,
  events,
  nextWeddingDate,
  telegramLinked,
  basePath,
}: {
  brideName: string;
  groomName: string;
  events: EventCardData[];
  nextWeddingDate: string | null;
  telegramLinked: boolean;
  basePath: "/dashboard" | "/dashboard/demo";
}) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "qrphoto_uz_bot";

  return (
    <>
      <Greeting
        brideName={brideName}
        groomName={groomName}
        nextWeddingDate={nextWeddingDate}
      />

      <section className="container-page py-10">
        {events.length === 0 ? (
          <EmptyStateInline />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-2">
            {events.map((e) => (
              <EventCard key={e.id} event={e} basePath={basePath} />
            ))}
          </div>
        )}
      </section>

      {!telegramLinked && events.length > 0 && (
        <section className="container-page pb-16">
          <TelegramCard botUsername={botUsername} />
        </section>
      )}
    </>
  );
}

function EmptyStateInline() {
  return (
    <div className="surface-card rounded-sm p-12 text-center">
      <p className="text-headline-sm">Альбомы появятся здесь</p>
      <p className="mt-2 text-body-md">
        Мы свяжем ваше событие с этим аккаунтом — и оно сразу станет доступно.
      </p>
    </div>
  );
}
