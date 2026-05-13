"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import {
  Download,
  Tv,
  Palette,
  Sparkles,
  Crown,
  CircleDot,
  Info,
  X,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  event: {
    id: string;
    title: string;
    wedding_date: string;
    status: string;
    tariff_code: string;
    brand_color: string | null;
    cover_url?: string | null;
  };
  basePath: "/dashboard" | "/dashboard/demo";
  onGenerateHighlights?: () => void;
  /** When true, action buttons open a "preview" toast instead of navigating. */
  demo?: boolean;
};

const TARIFF_META: Record<
  string,
  { label: string; gradient: string; icon: typeof Crown }
> = {
  basic: {
    label: "Basic",
    gradient: "linear-gradient(135deg, oklch(92% 0.03 70), oklch(82% 0.04 60))",
    icon: Sparkles,
  },
  pro: {
    label: "Pro",
    gradient: "linear-gradient(135deg, oklch(78% 0.1 35), oklch(68% 0.12 30))",
    icon: Crown,
  },
  premium: {
    label: "Premium",
    gradient: "linear-gradient(135deg, oklch(70% 0.13 30), oklch(55% 0.15 22))",
    icon: Crown,
  },
};

const STATUS_META: Record<
  string,
  { label: string; color: string; ring: string }
> = {
  active: { label: "Активна", color: "oklch(58% 0.13 145)", ring: "oklch(58% 0.13 145 / 0.25)" },
  draft: { label: "Черновик", color: "oklch(60% 0.04 80)", ring: "oklch(60% 0.04 80 / 0.2)" },
  archived: { label: "Архив", color: "oklch(55% 0.02 70)", ring: "oklch(55% 0.02 70 / 0.2)" },
  expired: { label: "Истекла", color: "oklch(60% 0.12 25)", ring: "oklch(60% 0.12 25 / 0.25)" },
};

export function EventHeader({
  event,
  basePath,
  onGenerateHighlights,
  demo = false,
}: Props) {
  const tint = event.brand_color ?? "#c89c66";
  const tariff = TARIFF_META[event.tariff_code] ?? TARIFF_META.basic;
  const status = STATUS_META[event.status] ?? STATUS_META.draft;
  const TariffIcon = tariff.icon;
  const brandingHref = `${basePath}/event/${event.id}/branding`;
  const liveHref = `/e/${event.id}/live`;

  const [demoNotice, setDemoNotice] = useState<string | null>(null);
  function demoClick(action: string, e: React.MouseEvent) {
    if (!demo) return;
    e.preventDefault();
    setDemoNotice(action);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="container-page pt-6 md:pt-10"
    >
      <div className="surface-card relative overflow-hidden rounded-(--radius-xl) p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: event.cover_url
              ? `center/cover no-repeat url(${event.cover_url})`
              : `linear-gradient(135deg, ${tint}33 0%, oklch(95% 0.03 70) 60%, ${tint}1a 100%)`,
          }}
        />
        {event.cover_url && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-white/55 backdrop-blur-md"
          />
        )}

        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-(--color-primary)">
              Свадьба ·{" "}
              {new Date(event.wedding_date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="font-display text-4xl md:text-5xl">
              <span className="text-gradient-gold italic">{event.title}</span>
            </h1>

            {/* Pretty status + tariff chips */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-(--shadow-soft)"
                style={{ background: tariff.gradient }}
              >
                <TariffIcon className="h-3.5 w-3.5" strokeWidth={2} />
                Тариф {tariff.label}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-medium backdrop-blur"
                style={{ boxShadow: `inset 0 0 0 1px ${status.ring}` }}
              >
                <CircleDot
                  className={cn(
                    "h-3.5 w-3.5",
                    event.status === "active" && "animate-pulse",
                  )}
                  strokeWidth={2.5}
                  style={{ color: status.color }}
                />
                <span style={{ color: status.color }}>{status.label}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <a
              href={`/api/couple/zip/${event.id}`}
              onClick={(e) => demoClick("Скачивание ZIP-альбома", e)}
              className={cn(buttonVariants({ size: "sm" }), "shadow-(--shadow-soft)")}
            >
              <Download className="mr-1.5 h-4 w-4" /> Скачать ZIP
            </a>
            <a
              href={liveHref}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => demoClick("Live-слайдшоу для проектора", e)}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "bg-white/70 backdrop-blur",
              )}
            >
              <Tv className="mr-1.5 h-4 w-4" /> Live
            </a>
            <a
              href={brandingHref}
              onClick={(e) => demoClick("Оформление: цвет и обложка события", e)}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "bg-white/70 backdrop-blur",
              )}
            >
              <Palette className="mr-1.5 h-4 w-4" /> Оформление
            </a>
            {onGenerateHighlights && (
              <button
                onClick={(e) => {
                  if (demo) {
                    e.preventDefault();
                    setDemoNotice("AI-подборка лучших кадров");
                    return;
                  }
                  onGenerateHighlights();
                }}
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "bg-white/70 backdrop-blur",
                )}
              >
                <Sparkles className="mr-1.5 h-4 w-4" /> AI-подборка
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {demoNotice && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 px-4"
          >
            <div className="surface-card flex items-center gap-3 rounded-full px-4 py-3 shadow-(--shadow-glow)">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
                <Info className="h-3.5 w-3.5" />
              </span>
              <div className="text-sm">
                <strong>{demoNotice}</strong>
                <span className="text-(--color-muted-foreground)">
                  {" "}
                  доступно после оплаты тарифа
                </span>
              </div>
              <button
                onClick={() => setDemoNotice(null)}
                className="ml-1 grid h-7 w-7 place-items-center rounded-full hover:bg-(--color-muted)"
                aria-label="Закрыть"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
