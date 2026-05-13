"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff, Star, Download, Sparkles, Layers } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { toggleHidden, toggleHighlight, requestExtension, requestPrint } from "./_actions";
import { cn } from "@/lib/utils";

export type GalleryItem = {
  id: string;
  kind: "photo";
  url: string;
  status: "ready" | "hidden" | "flagged";
  highlight: boolean;
};

type Extension = {
  id: string;
  extends_by_days: number;
  price_uzs: number;
  applied_at: string | null;
};

type Props = {
  event: {
    id: string;
    title: string;
    wedding_date: string;
    status: string;
    expires_at: string;
    photos_count: number;
    videos_count: number;
    guests_count: number;
    brand_color: string | null;
    tariff_code: string;
  };
  items: GalleryItem[];
  extensions: Extension[];
};

export function EventDashboard({ event, items, extensions }: Props) {
  const [tab, setTab] = useState<"gallery" | "moderate" | "highlights">("gallery");
  const [state, setState] = useState(items);

  function patch(id: string, updates: Partial<GalleryItem>) {
    setState((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
  }

  const visible = state.filter((i) =>
    tab === "moderate"
      ? true
      : tab === "highlights"
        ? i.highlight && i.status !== "hidden"
        : i.status !== "hidden",
  );

  return (
    <div className="container-page py-8">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl"
            style={{ color: event.brand_color ?? undefined }}
          >
            {event.title}
          </h1>
          <p className="text-sm text-(--color-muted-foreground)">
            Свадьба {event.wedding_date} · тариф {event.tariff_code} · альбом закроется{" "}
            {new Date(event.expires_at).toLocaleDateString("ru-RU")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`/api/couple/zip/${event.id}`}
            className={buttonVariants({ size: "sm" })}
          >
            <Download className="mr-2 h-4 w-4" /> Скачать ZIP
          </a>
          <a
            href={`/e/${event.id}/live`}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ size: "sm", variant: "outline" })}
          >
            <Layers className="mr-2 h-4 w-4" /> Live-слайдшоу
          </a>
          <form action={() => generateHighlights(event.id)}>
            <Button size="sm" variant="outline" formAction={() => generateHighlights(event.id)}>
              <Sparkles className="mr-2 h-4 w-4" /> AI-подборка
            </Button>
          </form>
        </div>
      </header>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Фото" value={event.photos_count} />
        <Stat label="Видео" value={event.videos_count} />
        <Stat label="Гостей с фото" value={event.guests_count} />
      </div>

      <UpsellBlock event={event} extensions={extensions} />

      <div className="mb-4 mt-10 flex gap-2 border-b border-(--color-border)">
        {[
          ["gallery", "Альбом"],
          ["moderate", "Модерация"],
          ["highlights", "Лучшие кадры"],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key as typeof tab)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm",
              tab === key
                ? "border-(--color-primary) text-(--color-foreground)"
                : "border-transparent text-(--color-muted-foreground) hover:text-(--color-foreground)",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-(--radius-lg) border border-dashed border-(--color-border) p-12 text-center text-(--color-muted-foreground)">
          Пока пусто
        </div>
      ) : tab === "moderate" ? (
        <ModerationGrid items={visible} onPatch={patch} />
      ) : (
        <GalleryGrid items={visible} onPatch={patch} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="px-6 py-5">
        <div className="text-3xl font-semibold">{value}</div>
        <div className="text-sm text-(--color-muted-foreground)">{label}</div>
      </CardContent>
    </Card>
  );
}

function GalleryGrid({
  items,
  onPatch,
}: {
  items: GalleryItem[];
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((m) => (
        <div key={m.id} className="group relative aspect-square overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={m.url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
          />
          <div className="absolute inset-x-2 top-2 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <HighlightButton item={m} onPatch={onPatch} />
            <HideButton item={m} onPatch={onPatch} />
          </div>
          {m.highlight && (
            <Star className="absolute right-2 top-2 h-5 w-5 fill-yellow-400 text-yellow-400" />
          )}
        </div>
      ))}
    </div>
  );
}

function ModerationGrid({
  items,
  onPatch,
}: {
  items: GalleryItem[];
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
      {items.map((m) => (
        <div
          key={m.id}
          className={cn(
            "relative overflow-hidden rounded-(--radius-lg) border border-(--color-border)",
            m.status === "hidden" && "opacity-40",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={m.url} alt="" loading="lazy" className="aspect-[4/3] w-full object-cover" />
          <div className="flex items-center justify-between p-3">
            <HighlightButton item={m} onPatch={onPatch} />
            <HideButton item={m} onPatch={onPatch} />
          </div>
        </div>
      ))}
    </div>
  );
}

function HideButton({
  item,
  onPatch,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
}) {
  const [pending, start] = useTransition();
  const Icon = item.status === "hidden" ? Eye : EyeOff;
  return (
    <button
      disabled={pending}
      onClick={() => {
        const nextStatus = item.status === "hidden" ? "ready" : "hidden";
        onPatch(item.id, { status: nextStatus });
        start(async () => {
          const res = await toggleHidden(item.id, nextStatus === "hidden");
          if (!res.ok) onPatch(item.id, { status: item.status });
        });
      }}
      className="rounded-full bg-black/50 p-2 text-white backdrop-blur"
      aria-label={item.status === "hidden" ? "Показать" : "Скрыть"}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function HighlightButton({
  item,
  onPatch,
}: {
  item: GalleryItem;
  onPatch: (id: string, u: Partial<GalleryItem>) => void;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        const next = !item.highlight;
        onPatch(item.id, { highlight: next });
        start(async () => {
          const res = await toggleHighlight(item.id, next);
          if (!res.ok) onPatch(item.id, { highlight: !next });
        });
      }}
      className="rounded-full bg-black/50 p-2 text-white backdrop-blur"
      aria-label="В лучшие"
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

function UpsellBlock({
  event,
  extensions,
}: {
  event: { id: string; expires_at: string };
  extensions: Extension[];
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(event.expires_at).getTime() - Date.now()) / 86_400_000),
  );
  const totalExtended = extensions
    .filter((e) => e.applied_at)
    .reduce((sum, e) => sum + e.extends_by_days, 0);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Сохранить альбом дольше</CardTitle>
          <CardDescription>
            Осталось {daysLeft} дней · уже продлено на {totalExtended} дней
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-(--color-muted-foreground)">
            +30 дней — 50 000 UZS. +90 дней — 120 000 UZS.
          </p>
          <div className="flex gap-2">
            {[
              { days: 30, price: 50_000 },
              { days: 90, price: 120_000 },
            ].map((opt) => (
              <Button
                key={opt.days}
                size="sm"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  start(async () => {
                    const res = await requestExtension(event.id, opt.days, opt.price);
                    setMsg(res.ok ? "Заявка отправлена — мы свяжемся для оплаты" : res.error);
                  })
                }
              >
                +{opt.days} дней
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Печатный фотоальбом</CardTitle>
          <CardDescription>Авто-вёрстка по лучшим кадрам</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-(--color-muted-foreground)">
            Печать в Ташкенте, доставка по UZ. От 590 000 UZS.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await requestPrint(event.id, "album", 590_000);
                setMsg(res.ok ? "Заявка на альбом отправлена" : res.error);
              })
            }
          >
            Заказать
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Брендированная USB-флешка</CardTitle>
          <CardDescription>Весь альбом + видео на флешке</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-3 text-sm text-(--color-muted-foreground)">
            Подарочная упаковка с именами. От 250 000 UZS.
          </p>
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const res = await requestPrint(event.id, "usb", 250_000);
                setMsg(res.ok ? "Заявка на флешку отправлена" : res.error);
              })
            }
          >
            Заказать
          </Button>
        </CardContent>
      </Card>

      {msg && (
        <div className="md:col-span-3 rounded-md bg-(--color-muted) p-3 text-sm">
          {msg}
        </div>
      )}
    </div>
  );
}

async function generateHighlights(eventId: string) {
  await fetch(`/api/couple/highlights/${eventId}`, { method: "POST" });
  window.location.reload();
}
