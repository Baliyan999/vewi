import { redirect } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { SettingsView } from "./_settings-view";

export const dynamic = "force-dynamic";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isSupabaseConfigured()) {
    redirect(`/${locale}/dashboard/demo/settings`);
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/dashboard/login`);

  const svc = createSupabaseServiceClient();
  const { data: couple } = await svc
    .from("couples")
    .select("bride_name, groom_name, phone, telegram_chat_id")
    .eq("user_id", user.id)
    .maybeSingle();

  const t = await getTranslations({ locale, namespace: "couple.settings" });
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "qrphoto_uz_bot";

  return (
    <SettingsView
      brideName={couple?.bride_name ?? "—"}
      groomName={couple?.groom_name ?? "—"}
      phone={couple?.phone ?? user.phone ?? "—"}
      telegramConnected={Boolean(couple?.telegram_chat_id)}
      botUsername={botUsername}
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
