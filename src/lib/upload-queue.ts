/**
 * Photo/video upload queue with IndexedDB persistence and exponential backoff.
 *
 * Flow:
 *   1. enqueue() — write blob to IndexedDB instantly (never lose a photo).
 *   2. flush() — try to upload each pending item; on failure, increment
 *      attempts and reschedule with exponential backoff.
 *   3. The CameraView calls flush() after every capture and on `online` event.
 *   4. A small singleton ticker re-flushes every 30 s while items remain.
 */

import { nanoid } from "nanoid";
import * as outbox from "./idb";

export type UploadArgs = {
  eventId: string;
  deviceId: string;
  guestName?: string;
  file: Blob;
  kind?: "photo" | "video";
  geo?: { lat: number; lng: number; accuracy: number };
};

export type QueueEvent =
  | { type: "queued"; remaining: number }
  | { type: "uploaded"; remaining: number; mediaId: string }
  | { type: "retry"; remaining: number; attempts: number }
  | { type: "failed"; remaining: number; error: string };

const listeners = new Set<(e: QueueEvent) => void>();

export function subscribe(fn: (e: QueueEvent) => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function emit(e: QueueEvent) {
  listeners.forEach((fn) => fn(e));
}

let flushing = false;
let tickerHandle: ReturnType<typeof setInterval> | null = null;

function startTicker() {
  if (tickerHandle || typeof window === "undefined") return;
  tickerHandle = setInterval(() => void flush(), 30_000);
  window.addEventListener("online", () => void flush());
}

function stopTickerIfEmpty(remaining: number) {
  if (remaining === 0 && tickerHandle) {
    clearInterval(tickerHandle);
    tickerHandle = null;
  }
}

export async function enqueue(args: UploadArgs): Promise<string> {
  const id = nanoid();
  const kind = args.kind ?? "photo";
  await outbox.enqueue({
    id,
    eventId: args.eventId,
    deviceId: args.deviceId,
    guestName: args.guestName,
    kind,
    blob: args.file,
    filename: `${kind}-${Date.now()}.${kind === "video" ? "webm" : "jpg"}`,
    createdAt: Date.now(),
    attempts: 0,
    nextAttemptAt: Date.now(),
  });
  emit({ type: "queued", remaining: await outbox.count() });
  startTicker();
  void flush();
  return id;
}

export async function flush(): Promise<void> {
  if (flushing) return;
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
  flushing = true;
  try {
    const items = await outbox.listPending();
    const now = Date.now();
    for (const item of items) {
      if (item.nextAttemptAt > now) continue;

      // Demo mode short-circuit
      if (item.eventId === "demo") {
        await outbox.remove(item.id);
        emit({
          type: "uploaded",
          remaining: await outbox.count(),
          mediaId: `demo-${item.id}`,
        });
        continue;
      }

      const form = new FormData();
      form.append("event_id", item.eventId);
      form.append("device_id", item.deviceId);
      form.append("kind", item.kind);
      if (item.guestName) form.append("guest_name", item.guestName);
      form.append("file", item.blob, item.filename);

      try {
        const res = await fetch("/api/guest/upload", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          // 4xx (quota, not_active, geofence) → permanent failure: drop the item
          if (res.status >= 400 && res.status < 500) {
            const error = await res.text().catch(() => `http ${res.status}`);
            await outbox.remove(item.id);
            emit({ type: "failed", remaining: await outbox.count(), error });
            continue;
          }
          throw new Error(`http ${res.status}`);
        }
        const json = (await res.json()) as { mediaId: string };
        await outbox.remove(item.id);
        const remaining = await outbox.count();
        emit({ type: "uploaded", remaining, mediaId: json.mediaId });
        stopTickerIfEmpty(remaining);
      } catch (err) {
        const attempts = item.attempts + 1;
        const backoffMs = Math.min(60_000 * 2 ** attempts, 30 * 60_000);
        await outbox.update({
          ...item,
          attempts,
          nextAttemptAt: Date.now() + backoffMs,
        });
        emit({
          type: "retry",
          remaining: await outbox.count(),
          attempts,
        });
        console.warn("[queue] retry scheduled", err);
      }
    }
  } finally {
    flushing = false;
  }
}

export async function pendingCount(): Promise<number> {
  return outbox.count();
}
