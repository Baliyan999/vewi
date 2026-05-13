"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Star, Eye, EyeOff, User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GalleryItem } from "./gallery";
import {
  toggleHidden,
  toggleHighlight,
} from "@/app/[locale]/(couple)/dashboard/event/[id]/_actions";

type GuestBucket = {
  id: string;
  name: string | null;
  count: number;
  highlights: number;
  hue: number;
  items: GalleryItem[];
};

export function GuestAlbums({
  items,
  onPatch,
  demo,
}: {
  items: GalleryItem[];
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  const buckets = useMemo(() => groupByGuest(items), [items]);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? buckets.find((b) => b.id === openId) ?? null : null;

  if (buckets.length === 0) {
    return (
      <div className="surface-card mt-6 rounded-(--radius-lg) p-12 text-center text-(--color-muted-foreground)">
        Гости ещё не присылали фото
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
      >
        {buckets.map((bucket) => (
          <motion.button
            key={bucket.id}
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
            }}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            onClick={() => setOpenId(bucket.id)}
            className="surface-card group relative overflow-hidden rounded-(--radius-lg) p-3 text-left"
          >
            <CollageCover bucket={bucket} />
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={bucket.name} hue={bucket.hue} size={36} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">
                  {bucket.name ?? "Гость"}
                </p>
                <p className="text-xs text-(--color-muted-foreground)">
                  {bucket.count} {plural(bucket.count, ["фото", "фото", "фото"])}
                  {bucket.highlights > 0 && (
                    <>
                      {" · "}
                      <span className="inline-flex items-center gap-0.5">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-500" />
                        {bucket.highlights}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </motion.div>

      <AnimatePresence>
        {open && (
          <GuestDrawer
            bucket={open}
            onClose={() => setOpenId(null)}
            onPatch={onPatch}
            demo={demo}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function CollageCover({ bucket }: { bucket: GuestBucket }) {
  // 4-up collage of the first four photos
  const tiles = bucket.items.slice(0, 4);
  // Pad with placeholders so the grid stays balanced
  while (tiles.length < 4) {
    tiles.push({
      ...tiles[tiles.length - 1],
      id: `${bucket.id}-pad-${tiles.length}`,
    });
  }
  return (
    <div className="grid aspect-[5/4] grid-cols-2 gap-1 overflow-hidden rounded-md">
      {tiles.map((t, i) => (
        <div
          key={`${t.id}-${i}`}
          className="grid place-items-center"
          style={{
            background: t.url
              ? `center/cover no-repeat url(${t.url})`
              : `linear-gradient(135deg, oklch(94% 0.05 ${t.hue ?? 35}), oklch(78% 0.09 ${(t.hue ?? 35) + 12}))`,
          }}
        >
          {!t.url && <Camera className="h-4 w-4 text-white/60" strokeWidth={1.5} />}
        </div>
      ))}
    </div>
  );
}

function GuestDrawer({
  bucket,
  onClose,
  onPatch,
  demo,
}: {
  bucket: GuestBucket;
  onClose: () => void;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.aside
        role="dialog"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 280, damping: 32 }}
        className="relative ml-auto flex h-full w-full max-w-3xl flex-col overflow-hidden bg-(--color-background) shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-center gap-4 border-b border-(--color-border) bg-white/80 px-6 py-5 backdrop-blur">
          <Avatar name={bucket.name} hue={bucket.hue} size={48} />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-2xl">
              {bucket.name ? `Альбом · ${bucket.name}` : "Альбом гостя"}
            </h2>
            <p className="text-sm text-(--color-muted-foreground)">
              {bucket.count} {plural(bucket.count, ["фото", "фото", "фото"])}
              {bucket.highlights > 0 && (
                <>
                  {" · "}
                  {bucket.highlights} в лучших
                </>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-(--color-muted)"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Photos */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {bucket.items.map((it) => (
              <DrawerTile
                key={it.id}
                item={it}
                onPatch={onPatch}
                demo={demo}
              />
            ))}
          </div>
        </div>

        {/* Footer with bulk hints (future: bulk download, share back) */}
        <footer className="border-t border-(--color-border) bg-white/70 px-6 py-3 text-xs text-(--color-muted-foreground) backdrop-blur">
          Это все фото с одного устройства. В реальном кабинете отсюда можно
          будет одной кнопкой отправить альбом гостю или скачать только его кадры.
        </footer>
      </motion.aside>
    </motion.div>
  );
}

function DrawerTile({
  item,
  onPatch,
  demo,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  const [pendingHi, startHi] = useTransition();
  const [pendingHide, startHide] = useTransition();

  function toggleHi(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !item.highlight;
    onPatch(item.id, { highlight: next });
    if (demo) return;
    startHi(async () => {
      const res = await toggleHighlight(item.id, next);
      if (!res.ok) onPatch(item.id, { highlight: !next });
    });
  }
  function toggleHi2(e: React.MouseEvent) {
    e.stopPropagation();
    const nextStatus = item.status === "hidden" ? "ready" : "hidden";
    onPatch(item.id, { status: nextStatus });
    if (demo) return;
    startHide(async () => {
      const res = await toggleHidden(item.id, nextStatus === "hidden");
      if (!res.ok) onPatch(item.id, { status: item.status });
    });
  }
  const HideIcon = item.status === "hidden" ? Eye : EyeOff;

  return (
    <div className="group relative aspect-square overflow-hidden rounded-md">
      {item.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `linear-gradient(135deg, oklch(94% 0.05 ${item.hue ?? 35}), oklch(78% 0.09 ${(item.hue ?? 35) + 12}))`,
          }}
        />
      )}
      {item.highlight && (
        <span className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/85 text-yellow-500 shadow-sm backdrop-blur transition-opacity group-hover:opacity-0">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
        </span>
      )}
      <div className="absolute inset-x-2 top-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
        <button
          disabled={pendingHi}
          onClick={toggleHi}
          className="rounded-full bg-black/55 p-2 text-white backdrop-blur"
          title={item.highlight ? "Убрать из лучших" : "В лучшие"}
        >
          <Star className={cn("h-4 w-4", item.highlight && "fill-yellow-400 text-yellow-400")} />
        </button>
        <button
          disabled={pendingHide}
          onClick={toggleHi2}
          className="rounded-full bg-black/55 p-2 text-white backdrop-blur"
          title={item.status === "hidden" ? "Вернуть в альбом" : "Скрыть"}
        >
          <HideIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function Avatar({
  name,
  hue,
  size = 40,
}: {
  name: string | null;
  hue: number;
  size?: number;
}) {
  const initial = name?.trim()?.[0]?.toUpperCase();
  return (
    <span
      aria-hidden
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, oklch(82% 0.08 ${hue}), oklch(65% 0.12 ${hue + 14}))`,
        fontSize: size * 0.42,
      }}
      className="grid shrink-0 place-items-center rounded-full font-display text-white shadow-(--shadow-soft)"
    >
      {initial ?? <User style={{ width: size * 0.5, height: size * 0.5 }} />}
    </span>
  );
}

function groupByGuest(items: GalleryItem[]): GuestBucket[] {
  const map = new Map<string, GuestBucket>();
  for (const item of items) {
    const id = item.guest_id ?? "_unknown";
    let bucket = map.get(id);
    if (!bucket) {
      bucket = {
        id,
        name: item.guest_name ?? null,
        count: 0,
        highlights: 0,
        hue: pickHue(id),
        items: [],
      };
      map.set(id, bucket);
    }
    bucket.items.push(item);
    bucket.count++;
    if (item.highlight) bucket.highlights++;
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}

function pickHue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  // Limit to a warm wedding palette (15–110)
  return 15 + (h % 96);
}

function plural(n: number, [one, few, many]: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}
