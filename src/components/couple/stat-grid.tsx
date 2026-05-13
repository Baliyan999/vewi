"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Camera, Video, Users, Star } from "lucide-react";
import { useTranslations } from "next-intl";

type StatItem = {
  key: "photos" | "videos" | "guests" | "highlights";
  value: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

const ITEMS: Pick<StatItem, "key" | "icon">[] = [
  { key: "photos", icon: Camera },
  { key: "videos", icon: Video },
  { key: "guests", icon: Users },
  { key: "highlights", icon: Star },
];

export function StatGrid({
  photos,
  videos,
  guests,
  highlights,
}: {
  photos: number;
  videos: number;
  guests: number;
  highlights: number;
}) {
  const t = useTranslations("couple.stats");
  const values = { photos, videos, guests, highlights };

  return (
    <section className="container-page pt-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.5, delay: i * 0.06 }}
            className="surface-card rounded-(--radius-lg) p-4 md:p-5"
          >
            <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-(--color-accent)/50 text-(--color-primary)">
              <it.icon className="h-4 w-4" strokeWidth={1.6} />
            </div>
            <Counter to={values[it.key]} />
            <div className="mt-1 text-xs uppercase tracking-wider text-(--color-muted-foreground)">
              {t(it.key)}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const dur = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const tt = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - tt, 3);
      setN(Math.round(to * eased));
      if (tt < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <div ref={ref} className="font-display text-3xl leading-none md:text-4xl">
      {n.toLocaleString("ru-RU")}
    </div>
  );
}
