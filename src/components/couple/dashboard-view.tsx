"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { FilmStrip } from "@/components/ui/film-strip";
import { cn } from "@/lib/utils";

/**
 * Couple Dashboard — 1:1 with VEWI Premium dashboard screen.
 *
 *  Welcome header
 *  Bento stats grid (Total Photos = col-span-2, then guest participation +
 *  table progress as squares)
 *  Two primary actions (gold filled + outlined)
 *  Film-strip divider
 *  Recent activity feed (alternating row tint, gold "Active" dot)
 */

export type DashboardEvent = {
  id: string;
  title: string;
  wedding_date: string;
  status: string;
  photos_count: number;
  videos_count: number;
  guests_count: number;
};

export type ActivityRow = {
  name: string;
  table: string;
  delta: number;
  active: boolean;
};

type Props = {
  event: DashboardEvent;
  guestsTotal: number;
  tablesTotal: number;
  tablesActive: number;
  activity: ActivityRow[];
  basePath: "/dashboard" | "/dashboard/demo";
};

export function DashboardView({
  event,
  guestsTotal,
  tablesTotal,
  tablesActive,
  activity,
  basePath,
}: Props) {
  const t = useTranslations("couple");
  const participation =
    guestsTotal > 0 ? Math.round((event.guests_count / guestsTotal) * 100) : 0;

  return (
    <div className="px-(--space-margin-mobile) flex flex-col gap-8 max-w-3xl mx-auto w-full pt-2">
      {/* Welcome */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-1 pt-4"
      >
        <h1 className="text-headline-md text-[color:var(--color-on-surface)]">
          {event.title}
        </h1>
        <p className="text-body-md text-[color:var(--color-on-surface-variant)]">
          Live overview of your event gallery.
        </p>
      </motion.section>

      {/* Bento stats */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-1"
      >
        <Stat
          label="Total Photos"
          big
          value={event.photos_count.toLocaleString("en-US")}
        />
        <Stat
          label="Guest Part."
          value={`${participation}%`}
          aspectSquare
        />
        <Stat
          label="Tables"
          value={`${tablesActive}/${tablesTotal}`}
          aspectSquare
        />
      </motion.section>

      {/* Actions */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-1"
      >
        <a
          href={`${basePath}/event/${event.id}`}
          className="w-full h-14 bg-[color:var(--color-accent-gold)] text-[color:var(--color-background)] label-caps border-[0.5px] border-[color:var(--color-accent-gold)] flex justify-center items-center gap-2 transition-opacity active:opacity-80 hover:opacity-90"
        >
          {t("card.open")}
          <Icon name="arrow_forward" size={16} />
        </a>
        <a
          href={`/api/couple/zip/${event.id}`}
          className="w-full h-14 bg-[color:var(--color-surface)] text-[color:var(--color-on-surface)] label-caps border-[0.5px] border-[color:var(--color-outline-variant)] flex justify-center items-center gap-2 hover:bg-[color:var(--color-surface-container-low)] transition-colors active:opacity-80"
        >
          {t("card.download")}
          <Icon name="download" size={16} />
        </a>
      </motion.section>

      {/* Film strip */}
      <div className="w-full h-8 flex items-center justify-center opacity-60">
        <FilmStrip />
      </div>

      {/* Activity */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 pb-4"
      >
        <h2 className="text-headline-sm text-[color:var(--color-on-surface)]">
          Recent Activity
        </h2>
        <div className="flex flex-col border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] divide-y-[0.5px] divide-[color:var(--color-outline-variant)]">
          {activity.map((row, i) => (
            <ActivityItem key={`${row.name}-${i}`} row={row} alt={i % 2 === 0} />
          ))}
          {activity.length === 0 && (
            <div className="p-6 text-center text-body-md text-[color:var(--color-on-surface-variant)]">
              Никто пока не загрузил фото
            </div>
          )}
        </div>
      </motion.section>
    </div>
  );
}

function Stat({
  label,
  value,
  big = false,
  aspectSquare = false,
}: {
  label: string;
  value: string;
  big?: boolean;
  aspectSquare?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)]",
        big
          ? "col-span-2 p-6 flex flex-col items-center justify-center text-center"
          : "p-4 flex flex-col justify-between items-start",
        aspectSquare && "aspect-square",
      )}
    >
      <span className="label-caps text-[color:var(--color-on-surface-variant)] mb-2">
        {label}
      </span>
      <span
        className={cn(
          "text-[color:var(--color-on-surface)]",
          big ? "text-display-lg" : "text-headline-md",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function ActivityItem({ row, alt }: { row: ActivityRow; alt: boolean }) {
  return (
    <div
      className={cn(
        "p-4 flex justify-between items-center",
        alt && "bg-[color:var(--color-surface-container)]/30",
      )}
    >
      <div className="flex flex-col">
        <span className="text-body-md text-[color:var(--color-on-surface)] font-medium">
          {row.name}
        </span>
        <span className="label-caps text-[color:var(--color-on-surface-variant)] mt-1">
          {row.table}
        </span>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-body-md text-[color:var(--color-on-surface)]">
          +{row.delta} Photos
        </span>
        <span
          className={cn(
            "label-caps mt-1 flex items-center gap-1",
            row.active
              ? "text-[color:var(--color-accent-gold)]"
              : "text-[color:var(--color-outline)]",
          )}
        >
          <span
            className={cn(
              "w-1.5 h-1.5 rounded-full",
              row.active
                ? "bg-[color:var(--color-accent-gold)] animate-pulse-dot"
                : "border-[0.5px] border-[color:var(--color-outline)]",
            )}
          />
          {row.active ? "Active" : "Idle"}
        </span>
      </div>
    </div>
  );
}
