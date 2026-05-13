import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { createSupabaseServiceClient } from "@/lib/supabase/server";
import type { EventRow, Tariff, MediaKind } from "@/lib/db/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PHOTO_BYTES = 20 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "bad_form" }, { status: 400 });
  }

  const eventId = String(form.get("event_id") ?? "");
  const deviceId = String(form.get("device_id") ?? "");
  const guestName = (form.get("guest_name") as string | null)?.slice(0, 40) ?? null;
  const kindRaw = String(form.get("kind") ?? "photo");
  const kind: MediaKind = kindRaw === "video" ? "video" : "photo";
  const file = form.get("file");
  const geoLat = parseNumber(form.get("geo_lat"));
  const geoLng = parseNumber(form.get("geo_lng"));
  const geoAcc = parseNumber(form.get("geo_accuracy"));

  if (!eventId || !deviceId || !(file instanceof Blob)) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const maxBytes = kind === "video" ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES;
  if (file.size > maxBytes) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }
  if (kind === "photo" && !file.type.startsWith("image/")) {
    return NextResponse.json({ error: "bad_mime" }, { status: 415 });
  }
  if (kind === "video" && !file.type.startsWith("video/")) {
    return NextResponse.json({ error: "bad_mime" }, { status: 415 });
  }

  const supabase = createSupabaseServiceClient();

  const { data: ev } = await supabase
    .from("events")
    .select("*, tariffs(*)")
    .eq("id", eventId)
    .maybeSingle();
  if (!ev) return NextResponse.json({ error: "event_not_found" }, { status: 404 });
  const event = ev as EventRow & { tariffs: Tariff };
  const tariff = event.tariffs;

  if (event.status !== "active") {
    return NextResponse.json({ error: "event_not_active" }, { status: 403 });
  }

  const now = Date.now();
  if (
    new Date(event.active_from).getTime() > now ||
    new Date(event.active_to).getTime() < now
  ) {
    return NextResponse.json({ error: "outside_active_window" }, { status: 403 });
  }

  // Geofence (server-side, can't be bypassed by tampering the client)
  if (
    event.geofence_enabled &&
    event.venue_lat != null &&
    event.venue_lng != null &&
    geoLat != null &&
    geoLng != null
  ) {
    const dist = haversineMeters(geoLat, geoLng, event.venue_lat, event.venue_lng);
    const allowed = event.venue_radius_m + (geoAcc ?? 0);
    if (dist > allowed) {
      return NextResponse.json({ error: "outside_geofence" }, { status: 403 });
    }
  }

  const { data: guest } = await supabase
    .from("guests")
    .upsert(
      {
        event_id: eventId,
        device_id: deviceId,
        display_name: guestName,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "event_id,device_id" },
    )
    .select("id, photos_taken, videos_taken")
    .single();

  if (!guest) {
    return NextResponse.json({ error: "guest_failed" }, { status: 500 });
  }

  const quota =
    kind === "video" ? tariff.videos_per_guest : tariff.photos_per_guest;
  const used = kind === "video" ? guest.videos_taken : guest.photos_taken;
  if (used >= quota) {
    return NextResponse.json({ error: "quota_exceeded" }, { status: 429 });
  }

  const bucket = kind === "video" ? "event-videos" : "event-photos";
  const ext = guessExt(file.type, kind);
  const objectKey = `${eventId}/${guest.id}/${nanoid()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadErr } = await supabase.storage
    .from(bucket)
    .upload(objectKey, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (uploadErr) {
    console.error("[upload] storage failed", uploadErr);
    return NextResponse.json({ error: "storage_failed" }, { status: 500 });
  }

  const { data: media, error: mediaErr } = await supabase
    .from("media")
    .insert({
      event_id: eventId,
      guest_id: guest.id,
      kind,
      status: "ready",
      storage_path: objectKey,
      mime: file.type,
      size_bytes: file.size,
    })
    .select("id")
    .single();
  if (mediaErr || !media) {
    console.error("[upload] media insert failed", mediaErr);
    return NextResponse.json({ error: "db_failed" }, { status: 500 });
  }

  await supabase
    .from("guests")
    .update(
      kind === "video"
        ? { videos_taken: guest.videos_taken + 1 }
        : { photos_taken: guest.photos_taken + 1 },
    )
    .eq("id", guest.id);

  // Best-effort: notify the couple via Telegram, but never block the upload
  void notifyCoupleNewMedia(eventId, kind).catch((err) =>
    console.warn("[upload] notify failed", err),
  );

  return NextResponse.json({ mediaId: media.id });
}

function parseNumber(v: FormDataEntryValue | null): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function guessExt(mime: string, kind: MediaKind): string {
  if (kind === "video") {
    if (mime.includes("mp4")) return "mp4";
    return "webm";
  }
  if (mime === "image/png") return "png";
  return "jpg";
}

function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const NOTIFY_DEBOUNCE_MS = 5 * 60_000;
const lastNotifyByEvent = new Map<string, number>();

async function notifyCoupleNewMedia(eventId: string, kind: MediaKind) {
  const last = lastNotifyByEvent.get(eventId) ?? 0;
  if (Date.now() - last < NOTIFY_DEBOUNCE_MS) return;
  lastNotifyByEvent.set(eventId, Date.now());

  const { notifyEvent } = await import("@/lib/telegram");
  await notifyEvent(eventId, {
    text:
      kind === "video"
        ? "📹 Гости начали присылать видео-поздравления"
        : "📸 Новые фото от ваших гостей",
  });
}
