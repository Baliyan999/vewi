import { setRequestLocale } from "next-intl/server";
import { Greeting } from "@/components/couple/greeting";
import { EventCard } from "@/components/couple/event-card";
import { TelegramCard } from "@/components/couple/telegram-card";
import { DEMO_COUPLE, DEMO_EVENTS } from "@/lib/demo-data";

export default async function DemoDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Greeting
        brideName={DEMO_COUPLE.bride_name}
        groomName={DEMO_COUPLE.groom_name}
        nextWeddingDate={DEMO_EVENTS[0].wedding_date}
      />
      <section className="container-page py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {DEMO_EVENTS.map((e) => (
            <EventCard key={e.id} event={e} basePath="/dashboard/demo" />
          ))}
        </div>
      </section>
      <section className="container-page pb-16">
        <TelegramCard botUsername="QRFotografBot" />
      </section>
    </>
  );
}
