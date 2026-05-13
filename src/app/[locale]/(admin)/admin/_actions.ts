"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const slug = customAlphabet("ABCDEFGHJKMNPQRSTUVWXYZ23456789", 6);

const schema = z.object({
  bride_name: z.string().min(2).max(60),
  groom_name: z.string().min(2).max(60),
  phone: z.string().regex(/^\+?[0-9()\s-]{7,20}$/),
  wedding_date: z.string().date(),
  tariff_code: z.enum(["basic", "pro", "premium"]),
  venue_name: z.string().max(120).optional().nullable(),
  venue_lat: z.coerce.number().min(-90).max(90).optional().nullable(),
  venue_lng: z.coerce.number().min(-180).max(180).optional().nullable(),
  geofence_enabled: z.boolean().default(true),
});

export type CreateEventInput = z.input<typeof schema>;

async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");
  const svc = createSupabaseServiceClient();
  const { data } = await svc.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) throw new Error("forbidden");
}

export async function createEvent(
  input: CreateEventInput,
): Promise<{ ok: true; eventId: string } | { ok: false; error: string }> {
  try {
    await requireAdmin();
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };
  }
  const d = parsed.data;

  const svc = createSupabaseServiceClient();

  // 1. Upsert couple by phone
  const { data: couple, error: coupleErr } = await svc
    .from("couples")
    .upsert(
      {
        bride_name: d.bride_name,
        groom_name: d.groom_name,
        phone: d.phone,
      },
      { onConflict: "phone" },
    )
    .select("id")
    .single();
  if (coupleErr || !couple) {
    return { ok: false, error: coupleErr?.message ?? "couple_failed" };
  }

  // 2. Create event
  const { data: event, error: eventErr } = await svc
    .from("events")
    .insert({
      couple_id: couple.id,
      tariff_code: d.tariff_code,
      title: `${d.bride_name} & ${d.groom_name}`,
      wedding_date: d.wedding_date,
      short_code: slug(),
      status: "active",
      venue_name: d.venue_name ?? null,
      venue_lat: d.venue_lat ?? null,
      venue_lng: d.venue_lng ?? null,
      geofence_enabled: d.geofence_enabled,
    })
    .select("id")
    .single();
  if (eventErr || !event) {
    return { ok: false, error: eventErr?.message ?? "event_failed" };
  }

  revalidatePath("/admin");
  return { ok: true, eventId: event.id };
}
