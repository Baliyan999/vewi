"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Heart } from "lucide-react";

type Props = {
  brideName: string;
  groomName: string;
  nextWeddingDate?: string | null;
};

function pickGreeting(hour: number, t: (k: string) => string) {
  if (hour >= 5 && hour < 12) return t("greetingMorning");
  if (hour >= 12 && hour < 18) return t("greetingDay");
  if (hour >= 18 && hour < 23) return t("greetingEvening");
  return t("greetingNight");
}

export function Greeting({ brideName, groomName, nextWeddingDate }: Props) {
  const t = useTranslations("couple");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <GreetingSkeleton brideName={brideName} groomName={groomName} />;
  }

  const greeting = pickGreeting(now.getHours(), t);

  let countdownLabel: string | null = null;
  let count: { d: number; h: number; m: number } | null = null;
  let isToday = false;
  let isPast = false;

  if (nextWeddingDate) {
    const target = new Date(nextWeddingDate + "T18:00:00");
    const diffMs = target.getTime() - now.getTime();
    isToday =
      target.toDateString() === now.toDateString();
    isPast = diffMs < -86_400_000; // past by more than a day
    const abs = Math.abs(diffMs);
    const d = Math.floor(abs / 86_400_000);
    const h = Math.floor((abs % 86_400_000) / 3_600_000);
    const m = Math.floor((abs % 3_600_000) / 60_000);
    count = { d, h, m };
    countdownLabel = isPast ? t("sinceWedding") : t("untilWedding");
  }

  return (
    <section className="container-page pt-8 md:pt-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <p className="mb-2 text-xs uppercase tracking-[0.28em] text-(--color-primary)">
          {greeting}
        </p>
        <h1 className="text-balance text-4xl md:text-6xl">
          <span>{brideName}</span>
          <span className="mx-3 inline-block text-gradient-gold italic">&amp;</span>
          <span>{groomName}</span>
        </h1>

        {count && countdownLabel && !isToday && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="mt-6 inline-flex items-center gap-3 rounded-full border border-(--color-border) bg-white/70 px-5 py-2.5 text-sm backdrop-blur"
          >
            <Heart className="h-4 w-4 text-(--color-primary)" />
            <span className="text-(--color-muted-foreground)">{countdownLabel}</span>
            <span className="font-display text-lg">
              {count.d}
              <span className="text-xs text-(--color-muted-foreground)">{t("daysShort")}</span>
              <span className="mx-1.5 text-(--color-border)">·</span>
              {count.h}
              <span className="text-xs text-(--color-muted-foreground)">{t("hoursShort")}</span>
              <span className="mx-1.5 text-(--color-border)">·</span>
              {count.m}
              <span className="text-xs text-(--color-muted-foreground)">{t("minutesShort")}</span>
            </span>
          </motion.div>
        )}

        {isToday && (
          <motion.p
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-(--color-primary) px-5 py-2.5 text-sm text-(--color-primary-foreground)"
          >
            <Heart className="h-4 w-4 animate-pulse" /> {t("today")}
          </motion.p>
        )}
      </motion.div>
    </section>
  );
}

function GreetingSkeleton({
  brideName,
  groomName,
}: {
  brideName: string;
  groomName: string;
}) {
  return (
    <section className="container-page pt-8 md:pt-12">
      <h1 className="text-balance text-4xl md:text-6xl opacity-0">
        {brideName} & {groomName}
      </h1>
    </section>
  );
}
