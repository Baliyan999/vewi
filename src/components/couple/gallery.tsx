"use client";

import { useState, useTransition, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  EyeClosed,
  Undo2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  toggleHidden,
  toggleHighlight,
} from "@/app/[locale]/(couple)/dashboard/event/[id]/_actions";
import { GuestAlbums } from "./guest-albums";

export type GalleryItem = {
  id: string;
  kind: "photo";
  url: string;
  /** Optional fallback hue for demo tiles without a real URL */
  hue?: number;
  status: "ready" | "hidden" | "flagged";
  highlight: boolean;
  guest_id?: string;
  guest_name?: string | null;
};

type Tab = "all" | "guests" | "highlights" | "hidden" | "moderate";

export function Gallery({
  items: initial,
  demo = false,
}: {
  items: GalleryItem[];
  demo?: boolean;
}) {
  const [items, setItems] = useState(initial);
  const [tab, setTab] = useState<Tab>("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const counts = useMemo(() => {
    const total = items.length;
    const hidden = items.filter((i) => i.status === "hidden").length;
    const highlights = items.filter(
      (i) => i.highlight && i.status !== "hidden",
    ).length;
    const guestIds = new Set(
      items
        .filter((i) => i.status !== "hidden" && i.guest_id)
        .map((i) => i.guest_id as string),
    );
    return {
      total,
      hidden,
      highlights,
      visible: total - hidden,
      guests: guestIds.size,
    };
  }, [items]);

  const visible = useMemo(() => {
    if (tab === "moderate") return items.filter((i) => i.status !== "hidden");
    if (tab === "highlights")
      return items.filter((i) => i.highlight && i.status !== "hidden");
    if (tab === "hidden") return items.filter((i) => i.status === "hidden");
    return items.filter((i) => i.status !== "hidden");
  }, [items, tab]);

  function patch(id: string, updates: Partial<GalleryItem>) {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }

  return (
    <section className="container-page pb-16 pt-8">
      <Tabs current={tab} onChange={setTab} counts={counts} />

      <AnimatePresence mode="wait">
        {tab === "moderate" && (
          <motion.div
            key="mod-hint"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-4 flex items-start gap-3 rounded-(--radius-lg) border border-(--color-accent)/60 bg-(--color-accent)/30 px-4 py-3 text-sm"
          >
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-(--color-primary)" />
            <p className="text-(--color-foreground)">
              <strong>Модерация — это ваш контроль над альбомом.</strong>{" "}
              Листайте кадры и одним кликом скрывайте неудачные:
              размытые, лишние мемы, фото с закрытыми глазами. Гости их не увидят
              в Live-слайдшоу, и они не попадут в итоговый ZIP. Передумаете —
              откройте вкладку «Скрытые» и вернёте в альбом.
            </p>
          </motion.div>
        )}
        {tab === "hidden" && counts.hidden === 0 && (
          <motion.div
            key="hidden-empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 rounded-(--radius-lg) border border-dashed border-(--color-border) bg-white/60 px-4 py-3 text-sm text-(--color-muted-foreground)"
          >
            Нет скрытых фото. Сюда попадают кадры, которые вы убираете
            из альбома на вкладке «Модерация».
          </motion.div>
        )}
      </AnimatePresence>

      {tab === "guests" ? (
        <GuestAlbums
          items={items.filter((i) => i.status !== "hidden")}
          onPatch={patch}
          demo={demo}
        />
      ) : visible.length === 0 ? (
        <div className="surface-card mt-6 rounded-(--radius-lg) p-12 text-center text-(--color-muted-foreground)">
          {tab === "highlights"
            ? "Ещё не выбрано ни одного лучшего кадра — отметьте звездой в альбоме"
            : tab === "hidden"
              ? "Здесь будут фото, которые вы скрыли"
              : "Пока пусто"}
        </div>
      ) : (
        <PhotoGrid
          mode={tab === "hidden" ? "hidden" : "default"}
          items={visible}
          onOpenLightbox={(idx) => setLightboxIdx(idx)}
          onPatch={patch}
          demo={demo}
        />
      )}

      <AnimatePresence>
        {lightboxIdx !== null && visible[lightboxIdx] && (
          <Lightbox
            items={visible}
            startIdx={lightboxIdx}
            onClose={() => setLightboxIdx(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function Tabs({
  current,
  onChange,
  counts,
}: {
  current: Tab;
  onChange: (t: Tab) => void;
  counts: {
    total: number;
    hidden: number;
    highlights: number;
    visible: number;
    guests: number;
  };
}) {
  const tabs: { key: Tab; label: string; count?: number; icon?: typeof Users }[] = [
    { key: "all", label: "Лента", count: counts.visible },
    { key: "guests", label: "По гостям", count: counts.guests, icon: Users },
    { key: "highlights", label: "Лучшие", count: counts.highlights },
    { key: "moderate", label: "Модерация" },
    { key: "hidden", label: "Скрытые", count: counts.hidden },
  ];

  return (
    <div className="flex w-fit flex-wrap gap-1 rounded-full border border-(--color-border) bg-white/70 p-1 backdrop-blur">
      {tabs.map(({ key, label, count, icon: Icon }) => {
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "relative inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm transition-colors",
              active
                ? "text-(--color-primary-foreground)"
                : "text-(--color-muted-foreground) hover:text-(--color-foreground)",
            )}
          >
            {active && (
              <motion.span
                layoutId="galleryTabPill"
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
                className="absolute inset-0 -z-10 rounded-full bg-(--color-primary)"
              />
            )}
            {Icon && <Icon className="relative h-3.5 w-3.5" strokeWidth={2} />}
            <span className="relative">{label}</span>
            {count !== undefined && (
              <span
                className={cn(
                  "relative rounded-full px-1.5 text-[10px] font-semibold",
                  active
                    ? "bg-white/25 text-white"
                    : "bg-(--color-muted) text-(--color-muted-foreground)",
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function PhotoGrid({
  items,
  onOpenLightbox,
  onPatch,
  demo,
  mode,
}: {
  items: GalleryItem[];
  onOpenLightbox: (idx: number) => void;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
  mode: "default" | "hidden";
}) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.03 } } }}
      className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {items.map((m, i) => (
        <Tile
          key={m.id}
          item={m}
          mode={mode}
          onOpen={() => onOpenLightbox(i)}
          onPatch={onPatch}
          demo={demo}
        />
      ))}
    </motion.div>
  );
}

function Tile({
  item,
  mode,
  onOpen,
  onPatch,
  demo,
}: {
  item: GalleryItem;
  mode: "default" | "hidden";
  onOpen: () => void;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, scale: 0.96 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
      }}
      className={cn(
        "group relative aspect-square cursor-zoom-in overflow-hidden rounded-md",
        mode === "hidden" && "opacity-70 ring-1 ring-(--color-border)",
      )}
      onClick={onOpen}
    >
      <TileImage item={item} />

      {/* Persistent badges (hidden on hover so action buttons can take over) */}
      {item.highlight && mode !== "hidden" && (
        <span
          aria-hidden
          className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/85 text-yellow-500 shadow-sm backdrop-blur transition-opacity duration-150 group-hover:opacity-0"
        >
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-500" />
        </span>
      )}
      {mode === "hidden" && (
        <span
          aria-hidden
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] text-white backdrop-blur transition-opacity duration-150 group-hover:opacity-0"
        >
          <EyeClosed className="h-3 w-3" /> скрыто
        </span>
      )}

      {/* Hover overlay: action buttons */}
      <div className="absolute inset-x-2 top-2 flex justify-between opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {mode === "hidden" ? (
          <RestoreBtn item={item} onPatch={onPatch} demo={demo} />
        ) : (
          <HighlightBtn item={item} onPatch={onPatch} demo={demo} />
        )}
        {mode !== "hidden" && (
          <HideBtn item={item} onPatch={onPatch} demo={demo} />
        )}
      </div>
    </motion.div>
  );
}

function TileImage({ item }: { item: GalleryItem }) {
  if (item.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={item.url}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    );
  }
  const hue = item.hue ?? 35;
  return (
    <div
      className="grid h-full w-full place-items-center"
      style={{
        background: `linear-gradient(135deg, oklch(94% 0.05 ${hue}), oklch(78% 0.09 ${hue + 12}))`,
      }}
    >
      <span className="text-4xl opacity-50">📸</span>
    </div>
  );
}

function HighlightBtn({
  item,
  onPatch,
  demo,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  const [pending, start] = useTransition();
  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    const next = !item.highlight;
    onPatch(item.id, { highlight: next });
    if (demo) return;
    start(async () => {
      const res = await toggleHighlight(item.id, next);
      if (!res.ok) onPatch(item.id, { highlight: !next });
    });
  }
  return (
    <button
      disabled={pending}
      onClick={onClick}
      title={item.highlight ? "Убрать из лучших" : "В лучшие"}
      className="rounded-full bg-black/55 p-2 text-white backdrop-blur"
      aria-label={item.highlight ? "Убрать из лучших" : "Добавить в лучшие"}
    >
      <Star
        className={cn(
          "h-4 w-4",
          item.highlight && "fill-yellow-400 text-yellow-400",
        )}
      />
    </button>
  );
}

function HideBtn({
  item,
  onPatch,
  demo,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  const [pending, start] = useTransition();
  const Icon = item.status === "hidden" ? Eye : EyeOff;
  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    const nextStatus = item.status === "hidden" ? "ready" : "hidden";
    onPatch(item.id, { status: nextStatus });
    if (demo) return;
    start(async () => {
      const res = await toggleHidden(item.id, nextStatus === "hidden");
      if (!res.ok) onPatch(item.id, { status: item.status });
    });
  }
  return (
    <button
      disabled={pending}
      onClick={onClick}
      title={item.status === "hidden" ? "Вернуть в альбом" : "Скрыть"}
      className="rounded-full bg-black/55 p-2 text-white backdrop-blur"
      aria-label={item.status === "hidden" ? "Вернуть в альбом" : "Скрыть"}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RestoreBtn({
  item,
  onPatch,
  demo,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
  demo: boolean;
}) {
  const [pending, start] = useTransition();
  function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    onPatch(item.id, { status: "ready" });
    if (demo) return;
    start(async () => {
      const res = await toggleHidden(item.id, false);
      if (!res.ok) onPatch(item.id, { status: "hidden" });
    });
  }
  return (
    <button
      disabled={pending}
      onClick={onClick}
      title="Вернуть в альбом"
      className="inline-flex items-center gap-1.5 rounded-full bg-(--color-primary) px-3 py-2 text-xs text-white shadow-sm backdrop-blur"
      aria-label="Вернуть в альбом"
    >
      <Undo2 className="h-3.5 w-3.5" /> Вернуть
    </button>
  );
}

function Lightbox({
  items,
  startIdx,
  onClose,
}: {
  items: GalleryItem[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const item = items[idx];

  function prev() {
    setIdx((i) => (i - 1 + items.length) % items.length);
  }
  function next() {
    setIdx((i) => (i + 1) % items.length);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "Escape") onClose();
      }}
      tabIndex={-1}
      autoFocus
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
        aria-label="Закрыть"
      >
        <X className="h-5 w-5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          prev();
        }}
        className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur md:left-8"
        aria-label="Назад"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          next();
        }}
        className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-white backdrop-blur md:right-8"
        aria-label="Вперёд"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.25 }}
          className="relative max-h-[88vh] max-w-[88vw]"
          onClick={(e) => e.stopPropagation()}
        >
          {item.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt=""
              className="max-h-[88vh] max-w-[88vw] rounded-md object-contain shadow-2xl"
            />
          ) : (
            <div
              className="grid h-[60vh] w-[80vw] max-w-3xl place-items-center rounded-md shadow-2xl"
              style={{
                background: `linear-gradient(135deg, oklch(94% 0.05 ${item.hue ?? 35}), oklch(78% 0.09 ${(item.hue ?? 35) + 12}))`,
              }}
            >
              <span className="text-7xl opacity-50">📸</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur">
        {idx + 1} / {items.length}
      </div>
    </motion.div>
  );
}
