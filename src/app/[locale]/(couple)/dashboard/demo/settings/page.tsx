import { setRequestLocale, getTranslations } from "next-intl/server";
import { SettingsView } from "@/app/[locale]/(couple)/dashboard/settings/_settings-view";
import { DEMO_COUPLE } from "@/lib/demo-data";

export default async function DemoSettings({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "couple.settings" });

  return (
    <SettingsView
      brideName={DEMO_COUPLE.bride_name}
      groomName={DEMO_COUPLE.groom_name}
      phone={DEMO_COUPLE.phone}
      telegramConnected={false}
      botUsername="qrphoto_uz_bot"
      labels={{
        title: t("title"),
        phone: t("phone"),
        telegram: t("telegram"),
        telegramHint: t("telegramHint"),
        telegramConnect: t("telegramConnect"),
        language: t("language"),
        save: t("save"),
      }}
    />
  );
}
