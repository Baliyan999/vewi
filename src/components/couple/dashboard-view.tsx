"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * VEWI Couple Dashboard — wireframe-faithful version.
 *
 *  Header: "Alina & Rustam" with gold "&" + green pulsing "ИДЁТ СВАДЬБА" badge
 *  Stats row: 3 big numbers (ФОТО / ГОСТЕЙ / СТОЛОВ)
 *  Activity feed: avatar circle + name + table + gold progress bar + "N фото"
 *  Two CTAs at bottom: filled gold + outlined
 */

export type DashboardEvent = {
  id: string;
  title: string;
  status: string;
  photos_count: number;
  guests_count: number;
};

export type ActivityRow = {
  name: string;
  table: string;
  delta: number;
  active?: boolean;
};

type Props = {
  event: DashboardEvent;
  tablesTotal: number;
  activity: ActivityRow[];
  basePath: "/dashboard" | "/dashboard/demo";
};

export function DashboardView({
  event,
  tablesTotal,
  activity,
  basePath,
}: Props) {
  const isLive = event.status === "active";
  const max = Math.max(1, ...activity.map((a) => a.delta));

  // Split "Alina & Rustam" → ["Alina", "&", "Rustam"] so the ampersand can
  // pick up the gold italic accent on its own.
  const titleParts = event.title.split(/\s*&\s*/);
  const [first, second] = titleParts.length >= 2
    ? [titleParts[0], titleParts.slice(1).join(" & ")]
    : [event.title, ""];

  return (
    <div className="px-(--space-margin-mobile) flex flex-col gap-8 max-w-2xl mx-auto w-full pt-4 pb-10">
      {/* Header */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-start justify-between gap-4 pb-4 border-b-[0.5px] border-[color:var(--color-outline-variant)]"
      >
        <h1 className="text-headline-md text-[color:var(--color-on-surface)]">
          {first}{second && (
            <>
              {" "}
              <span className="italic text-[color:var(--color-accent-gold)]">
                &amp;
              </span>{" "}
              {second}
            </>
          )}
        </h1>
        {isLive && (
          <span className="inline-flex items-center gap-1.5 label-caps text-[10px] text-[color:var(--color-accent-gold)] border-[0.5px] border-[color:var(--color-accent-gold)] px-2 py-1 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--color-accent-gold)] animate-pulse-dot" />
            Идёт свадьба
          </span>
        )}
      </motion.section>

      {/* Stats row */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-3 gap-1"
      >
        <Stat n={event.photos_count} label="Фото" />
        <Stat n={event.guests_count} label="Гостей" />
        <Stat n={tablesTotal} label="Столов" />
      </motion.section>

      {/* Activity */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4"
      >
        <h2 className="label-caps text-[color:var(--color-on-surface-variant)]">
          Активность гостей
        </h2>
        <div className="flex flex-col">
          {activity.map((row, i) => (
            <ActivityItem key={`${row.name}-${i}`} row={row} max={max} index={i} />
          ))}
          {activity.length === 0 && (
            <div className="border-[0.5px] border-[color:var(--color-outline-variant)] p-6 text-center text-body-md text-[color:var(--color-on-surface-variant)]">
              Никто пока не загрузил фото
            </div>
          )}
        </div>
      </motion.section>

      {/* CTAs */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-2 gap-1 mt-2"
      >
        <a
          href={`${basePath}/event/${event.id}`}
          className="h-12 bg-[color:var(--color-accent-gold)] text-[color:var(--color-background)] label-caps flex items-center justify-center gap-2 active:opacity-80 hover:opacity-90 transition-opacity"
        >
          <Icon name="auto_stories" size={16} />
          Открыть галерею
        </a>
        <a
          href={`/api/couple/zip/${event.id}`}
          className="h-12 border-[0.5px] border-[color:var(--color-outline-variant)] text-[color:var(--color-on-surface)] label-caps flex items-center justify-center gap-2 hover:border-[color:var(--color-accent-gold)] hover:text-[color:var(--color-accent-gold)] transition-colors active:opacity-80"
        >
          <Icon name="download" size={16} />
          Скачать всё
        </a>
      </motion.section>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] py-6 px-3 flex flex-col items-center gap-1.5">
      <span className="text-display-md text-[color:var(--color-on-surface)] leading-none">
        {n}
      </span>
      <span className="label-caps text-[color:var(--color-on-surface-variant)] text-[10px]">
        {label}
      </span>
    </div>
  );
}

function ActivityItem({
  row,
  max,
  index,
}: {
  row: ActivityRow;
  max: number;
  index: number;
}) {
  const pct = Math.max(8, Math.round((row.delta / max) * 100));
  const initial = row.name.trim()[0]?.toUpperCase() ?? "?";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="flex items-center gap-3 py-3 border-b-[0.5px] border-[color:var(--color-outline-variant)] last:border-b-0"
    >
      <span className="grid place-items-center w-9 h-9 rounded-full border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] text-[color:var(--color-on-surface)] font-display text-[16px] shrink-0">
        {initial}
      </span>

      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-body-md text-[color:var(--color-on-surface)] truncate font-medium leading-tight">
              {row.name}
            </div>
            <div className="label-caps text-[9px] text-[color:var(--color-on-surface-variant)] mt-0.5">
              {row.table}
            </div>
          </div>
          <span className="text-body-md text-[color:var(--color-on-surface-variant)] shrink-0">
            {row.delta} фото
          </span>
        </div>
        <div className="h-px w-full bg-[color:var(--color-outline-variant)] relative">
          <motion.span
            className={cn(
              "absolute inset-y-0 left-0 bg-[color:var(--color-accent-gold)]",
              row.active && "shadow-[0_0_4px_rgba(184,151,74,0.6)]",
            )}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, delay: 0.2 + index * 0.08, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>
    </motion.div>
  );
}
