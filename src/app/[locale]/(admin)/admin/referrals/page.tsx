import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralForm } from "./_referral-form";
import { SetupRequired } from "@/components/couple/setup-required";

export const dynamic = "force-dynamic";

export default async function ReferralsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isSupabaseConfigured()) {
    return <SetupRequired demoHref={`/${locale}/dashboard/demo`} />;
  }

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/admin/login`);
  const svc = createSupabaseServiceClient();
  const { data: admin } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) redirect(`/${locale}/admin/login`);

  const { data: codes } = await svc
    .from("referral_codes")
    .select("code, owner_name, owner_phone, percent, active, created_at")
    .order("created_at", { ascending: false });

  const { data: refs } = await svc
    .from("referrals")
    .select("code, event_id, order_id, commission_uzs, paid_at, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl">Реферальная программа</h1>

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Новый код</CardTitle>
            <CardDescription>Партнёрам — для рекомендации платформы</CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralForm />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Активные коды</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-(--color-muted-foreground)">
                  <tr>
                    <th className="py-2">Код</th>
                    <th className="py-2">Партнёр</th>
                    <th className="py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  {(codes ?? []).map((c) => (
                    <tr key={c.code} className="border-t border-(--color-border)">
                      <td className="py-2 font-mono">{c.code}</td>
                      <td className="py-2">{c.owner_name}<br /><span className="text-xs text-(--color-muted-foreground)">{c.owner_phone}</span></td>
                      <td className="py-2">{c.percent}%</td>
                    </tr>
                  ))}
                  {(codes ?? []).length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-(--color-muted-foreground)">Пока нет кодов</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Последние использования</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-(--color-muted-foreground)">
                  <tr>
                    <th className="py-2">Код</th>
                    <th className="py-2">Комиссия</th>
                    <th className="py-2">Выплачено</th>
                  </tr>
                </thead>
                <tbody>
                  {(refs ?? []).map((r) => (
                    <tr key={r.order_id ?? r.event_id} className="border-t border-(--color-border)">
                      <td className="py-2 font-mono">{r.code}</td>
                      <td className="py-2">{r.commission_uzs ? r.commission_uzs.toLocaleString("ru-RU") + " UZS" : "—"}</td>
                      <td className="py-2">{r.paid_at ? new Date(r.paid_at).toLocaleDateString("ru-RU") : "—"}</td>
                    </tr>
                  ))}
                  {(refs ?? []).length === 0 && (
                    <tr><td colSpan={3} className="py-6 text-center text-(--color-muted-foreground)">Пока нет</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
