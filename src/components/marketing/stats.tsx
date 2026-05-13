"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { FilmStrip } from "@/components/ui/film-strip";

const ITEMS = [
  { value: 350, suffix: "+", label: "свадеб собрано" },
  { value: 180_000, suffix: "+", label: "кадров от гостей" },
  { value: 96, suffix: "%", label: "молодожёнов рекомендуют" },
] as const;

export function Stats() {
  return (
    <>
      <div className="container-page">
        <FilmStrip />
      </div>
      <section className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-(--space-gutter) max-w-5xl mx-auto">
          {ITEMS.map((it, i) => (
            <motion.div
              key={it.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="border-[0.5px] border-[color:var(--color-outline-variant)] p-8 flex flex-col gap-2 bg-[color:var(--color-surface)]"
            >
              <Counter to={it.value} suffix={it.suffix} />
              <p className="label-caps text-[color:var(--color-on-surface-variant)]">
                {it.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const startedAt = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(Math.round(to * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref} className="text-display-md text-[color:var(--color-on-surface)]">
      {n.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}
