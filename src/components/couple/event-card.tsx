"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Download, Tv, ArrowUpRight, Calendar, Users, Camera, Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type EventCardData = {
  id: string;
  title: string;
  wedding_date: string;
  status: "draft" | "active" | "archived" | "expired";
  expires_at: string;
  photos_count: number;
  videos_count: number;
  guests_count: number;
  brand_color: string | null;
  tariff_code: string;
  cover_url: string | null;
};

export function EventCard({
  event,
  basePath,
}: {
  event: EventCardData;
  basePath: "/dashboard" | "/dashboard/demo";
}) {
  const t = useTranslations("couple");
  const expires = new Date(event.expires_at);
  const expiresStr = expires.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
  });

  const tint = event.brand_color ?? "#c89c66";
  const eventHref = `${basePath}/event/${event.id}`;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className="surface-card group relative flex flex-col overflow-hidden rounded-(--radius-xl)"
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: event.cover_url
              ? `center/cover no-repeat url(${event.cover_url})`
              : `linear-gradient(135deg, ${tint}aa 0%, oklch(90% 0.05 70) 50%, ${tint}66 100%)`,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
          <div>
            <h3 className="font-display text-2xl drop-shadow-md md:text-3xl">
              {event.title}
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-white/85 drop-shadow">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(event.wedding_date).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={<Camera className="h-3.5 w-3.5" />} value={event.photos_count} label={t("stats.photos")} />
          <Stat icon={<Video className="h-3.5 w-3.5" />} value={event.videos_count} label={t("stats.videos")} />
          <Stat icon={<Users className="h-3.5 w-3.5" />} value={event.guests_count} label={t("stats.guests")} />
        </div>

        <p className="text-xs text-(--color-muted-foreground)">
          {t("card.expiresIn", { date: expiresStr })}
        </p>

        <div className="mt-auto grid grid-cols-2 gap-2">
          <a
            href={eventHref}
            className={cn(
              buttonVariants({ size: "sm" }),
              "shadow-(--shadow-soft)",
            )}
          >
            {t("card.open")}
            <ArrowUpRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href={`/api/couple/zip/${event.id}`}
            className={cn(
              buttonVariants({ size: "sm", variant: "outline" }),
              "bg-white/70 backdrop-blur",
            )}
          >
            <Download className="mr-1.5 h-4 w-4" />
            ZIP
          </a>
        </div>
        <a
          href={`/e/${event.id}/live`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 text-xs text-(--color-muted-foreground) hover:text-(--color-primary)"
        >
          <Tv className="h-3.5 w-3.5" /> {t("card.live")}
        </a>
      </div>
    </motion.article>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-xl bg-(--color-muted)/60 p-3 text-center">
      <div className="mb-1 flex items-center justify-center text-(--color-primary)">
        {icon}
      </div>
      <div className="font-display text-xl leading-none">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-(--color-muted-foreground)">
        {label}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EventCardData["status"] }) {
  const t = useTranslations("couple.card");
  const map: Record<EventCardData["status"], { label: string; cls: string }> = {
    active: { label: t("active"), cls: "bg-emerald-500/95" },
    draft: { label: t("draft"), cls: "bg-amber-500/90" },
    archived: { label: t("archived"), cls: "bg-slate-500/90" },
    expired: { label: t("expired"), cls: "bg-red-500/90" },
  };
  const v = map[status];
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-[10px] uppercase tracking-widest text-white shadow",
        v.cls,
      )}
    >
      {v.label}
    </span>
  );
}
