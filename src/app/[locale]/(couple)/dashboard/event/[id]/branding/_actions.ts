"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createSupabaseServerClient, createSupabaseServiceClient } from "@/lib/supabase/server";

const MAX_COVER_BYTES = 5 * 1024 * 1024;

const schema = z.object({
  event_id: z.string().uuid(),
  brand_color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
});

export async function saveBranding(
  form: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "unauthorized" };

  const parsed = schema.safeParse({
    event_id: form.get("event_id"),
    brand_color: form.get("brand_color"),
  });
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid input" };

  const svc = createSupabaseServiceClient();
  const { data: event } = await svc
    .from("events")
    .select("id, couples!inner(user_id)")
    .eq("id", parsed.data.event_id)
    .maybeSingle();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!event || (event as any).couples.user_id !== user.id) {
    return { ok: false, error: "forbidden" };
  }

  let coverPath: string | undefined;
  const cover = form.get("cover");
  if (cover instanceof Blob && cover.size > 0) {
    if (cover.size > MAX_COVER_BYTES) {
      return { ok: false, error: "cover_too_large" };
    }
    if (!cover.type.startsWith("image/")) {
      return { ok: false, error: "cover_bad_mime" };
    }
    const ext = cover.type === "image/png" ? "png" : "jpg";
    coverPath = `events/${parsed.data.event_id}/cover.${ext}`;
    const buf = new Uint8Array(await cover.arrayBuffer());
    const { error } = await svc.storage
      .from("event-assets")
      .upload(coverPath, buf, { contentType: cover.type, upsert: true });
    if (error) return { ok: false, error: error.message };
  }

  const update: Record<string, unknown> = {
    brand_color: parsed.data.brand_color,
  };
  if (coverPath) update.cover_image_path = coverPath;

  const { error } = await svc.from("events").update(update).eq("id", parsed.data.event_id);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/dashboard/event/${parsed.data.event_id}`);
  revalidatePath(`/dashboard/event/${parsed.data.event_id}/branding`);
  return { ok: true };
}
