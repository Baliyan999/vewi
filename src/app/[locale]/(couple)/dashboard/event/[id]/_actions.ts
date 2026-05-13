"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/telegram";

async function authCouple(eventId: string): Promise<
  | { ok: true; userId: string; coupleId: string }
  | { ok: false; error: string }
> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const svc = createSupabaseServiceClient();
  const { data: couple } = await svc
    .from("couples")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!couple) return { ok: false, error: "no_couple" };

  const { data: event } = await svc
    .from("events")
    .select("id, title")
    .eq("id", eventId)
    .eq("couple_id", couple.id)
    .maybeSingle();
  if (!event) return { ok: false, error: "forbidden" };

  return { ok: true, userId: user.id, coupleId: couple.id };
}

export async function toggleHidden(
  mediaId: string,
  hidden: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const svc = createSupabaseServiceClient();
  // Ownership check via join
  const { data: media } = await svc
    .from("media")
    .select("id, events!inner(couple_id, couples!inner(user_id))")
    .eq("id", mediaId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (media as any)?.events?.couples?.user_id;
  if (!media || ownerId !== user.id) return { ok: false, error: "forbidden" };

  await svc
    .from("media")
    .update({
      status: hidden ? "hidden" : "ready",
      hidden_by: hidden ? user.id : null,
      hidden_at: hidden ? new Date().toISOString() : null,
    })
    .eq("id", mediaId);

  return { ok: true };
}

export async function toggleHighlight(
  mediaId: string,
  highlight: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const svc = createSupabaseServiceClient();
  const { data: media } = await svc
    .from("media")
    .select("id, events!inner(couple_id, couples!inner(user_id))")
    .eq("id", mediaId)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ownerId = (media as any)?.events?.couples?.user_id;
  if (!media || ownerId !== user.id) return { ok: false, error: "forbidden" };

  await svc.from("media").update({ is_highlight: highlight }).eq("id", mediaId);
  return { ok: true };
}

export async function requestExtension(
  eventId: string,
  days: number,
  priceUzs: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await authCouple(eventId);
  if (!auth.ok) return auth;

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("storage_extensions").insert({
    event_id: eventId,
    extends_by_days: days,
    price_uzs: priceUzs,
  });
  if (error) return { ok: false, error: error.message };

  await notifyAdmin(
    `🪙 Заявка на продление хранения\nEvent: ${eventId}\nДней: ${days}\nСумма: ${priceUzs.toLocaleString("ru-RU")} UZS`,
  );
  revalidatePath(`/dashboard/event/${eventId}`);
  return { ok: true };
}

export async function requestPrint(
  eventId: string,
  kind: "album" | "usb" | "photobook",
  priceUzs: number,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await authCouple(eventId);
  if (!auth.ok) return auth;

  const svc = createSupabaseServiceClient();
  const { error } = await svc.from("print_orders").insert({
    event_id: eventId,
    couple_id: auth.coupleId,
    kind,
    price_uzs: priceUzs,
  });
  if (error) return { ok: false, error: error.message };

  await notifyAdmin(
    `🎁 Заявка: ${kind}\nEvent: ${eventId}\nСумма: ${priceUzs.toLocaleString("ru-RU")} UZS`,
  );
  return { ok: true };
}
