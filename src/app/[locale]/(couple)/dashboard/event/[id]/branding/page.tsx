import { redirect, notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { BrandingForm } from "./_branding-form";

export const dynamic = "force-dynamic";

export default async function BrandingPage({
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
    .select("id, title, brand_color, cover_image_path, branding")
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

  return (
    <div className="container-page py-10">
      <p className="mb-2 text-xs uppercase tracking-[0.28em] text-(--color-primary)">
        Брендинг
      </p>
      <h1 className="mb-2 font-display text-4xl md:text-5xl">{event.title}</h1>
      <p className="mb-10 text-sm text-(--color-muted-foreground)">
        Цвет и обложка показываются гостям перед камерой и на live-слайдшоу
      </p>
      <BrandingForm
        event={{
          id: event.id,
          brand_color: event.brand_color ?? "#c89c66",
          cover_url: coverUrl,
        }}
      />
    </div>
  );
}
