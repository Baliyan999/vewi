"use client";

import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  eventId: string;
  title: string;
  brandColor: string | null;
  initialUrls: string[];
};

const MAX_FRAMES = 60;
const ROTATE_MS = 4500;

export function LiveSlideshow({ eventId, title, brandColor, initialUrls }: Props) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [activeIdx, setActiveIdx] = useState(0);
  const incomingRef = useRef<string | null>(null);
  const [flash, setFlash] = useState(false);

  // Auto-rotate
  useEffect(() => {
    if (urls.length === 0) return;
    const t = setInterval(() => {
      setActiveIdx((i) => (i + 1) % urls.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [urls.length]);

  // Subscribe to realtime inserts; resolve signed URLs on the fly
  useEffect(() => {
    if (eventId === "demo") return;
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`live:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "media",
          filter: `event_id=eq.${eventId}`,
        },
        async (payload) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const row = payload.new as any;
          if (row.kind !== "photo" || row.status !== "ready") return;

          const { data } = await supabase.storage
            .from("event-photos")
            .createSignedUrl(row.storage_path, 60 * 60 * 12);
          if (!data?.signedUrl) return;

          incomingRef.current = data.signedUrl;
          setFlash(true);
          setTimeout(() => setFlash(false), 800);

          setUrls((prev) => {
            const next = [data.signedUrl, ...prev].slice(0, MAX_FRAMES);
            return next;
          });
          setActiveIdx(0);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const empty = urls.length === 0;
  const tint = brandColor ?? "#c89c66";

  return (
    <div
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-black text-white"
      style={{
        background: `radial-gradient(circle at 50% 50%, ${tint}22, #000 80%)`,
      }}
    >
      {/* Mosaic background */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-6 gap-1 opacity-25 blur-sm">
        {urls.slice(0, 24).map((u, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={`${u}-${i}`} src={u} alt="" className="aspect-square w-full object-cover" />
        ))}
      </div>

      {/* Center stage */}
      <header className="relative z-10 pt-10 text-center">
        <p className="text-sm uppercase tracking-[0.4em] text-white/60">
          Live · {title}
        </p>
      </header>

      <div className="relative z-10 mt-6 flex aspect-[3/2] w-[80vw] max-w-5xl items-center justify-center overflow-hidden rounded-2xl bg-white/5 shadow-2xl">
        {empty ? (
          <div className="text-center text-white/60">
            <p className="text-3xl">📸</p>
            <p className="mt-2">Ждём первые фото от гостей…</p>
          </div>
        ) : (
          urls.map((u, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${u}-${i}`}
              src={u}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
              style={{ opacity: i === activeIdx ? 1 : 0 }}
            />
          ))
        )}
      </div>

      <footer className="relative z-10 mt-6 text-center text-white/70">
        <p className="text-sm">
          Сосканируй QR на столе и присоединяйся · {urls.length} фото уже в альбоме
        </p>
      </footer>

      {flash && (
        <div
          className="pointer-events-none absolute inset-0 z-20 animate-pulse bg-white/10"
          aria-hidden
        />
      )}
    </div>
  );
}
