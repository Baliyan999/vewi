import { setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CreateEventForm } from "./_create-event-form";
import { SetupRequired } from "@/components/couple/setup-required";

export const dynamic = "force-dynamic";

async function isAdminUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const svc = createSupabaseServiceClient();
  const { data } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  return Boolean(data);
}

export default async function AdminHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (!isSupabaseConfigured()) {
    return <SetupRequired demoHref={`/${locale}/dashboard/demo`} />;
  }

  const ok = await isAdminUser();
  if (!ok) redirect(`/${locale}/admin/login`);

  const svc = createSupabaseServiceClient();
  const [{ data: events }, { data: leads }] = await Promise.all([
    svc.from("events").select("id, title, wedding_date, status, short_code, tariff_code").order("wedding_date", { ascending: false }).limit(20),
    svc.from("leads").select("id, name, phone, wedding_date, status, created_at").order("created_at", { ascending: false }).limit(20),
  ]);

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl">Админка</h1>

      <div className="grid gap-8 lg:grid-cols-[2fr_3fr]">
        <Card>
          <CardHeader>
            <CardTitle>Создать событие</CardTitle>
            <CardDescription>После создания скачайте PDF с QR-кодами</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateEventForm />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Свадьбы</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-(--color-muted-foreground)">
                  <tr>
                    <th className="py-2">Название</th>
                    <th className="py-2">Дата</th>
                    <th className="py-2">Тариф</th>
                    <th className="py-2">Статус</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {(events ?? []).map((e) => (
                    <tr key={e.id} className="border-t border-(--color-border)">
                      <td className="py-2">{e.title}</td>
                      <td className="py-2">{e.wedding_date}</td>
                      <td className="py-2">{e.tariff_code}</td>
                      <td className="py-2">{e.status}</td>
                      <td className="py-2 text-right">
                        <a
                          href={`/api/admin/qr-pdf/${e.id}`}
                          className="text-(--color-primary) underline"
                        >
                          QR PDF
                        </a>
                      </td>
                    </tr>
                  ))}
                  {(events ?? []).length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-(--color-muted-foreground)">Пока нет событий</td></tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Заявки с лендинга</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead className="text-left text-(--color-muted-foreground)">
                  <tr>
                    <th className="py-2">Имя</th>
                    <th className="py-2">Телефон</th>
                    <th className="py-2">Дата</th>
                    <th className="py-2">Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {(leads ?? []).map((l) => (
                    <tr key={l.id} className="border-t border-(--color-border)">
                      <td className="py-2">{l.name}</td>
                      <td className="py-2 font-mono text-xs">{l.phone}</td>
                      <td className="py-2">{l.wedding_date ?? "—"}</td>
                      <td className="py-2">{l.status}</td>
                    </tr>
                  ))}
                  {(leads ?? []).length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-(--color-muted-foreground)">Заявок пока нет</td></tr>
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
