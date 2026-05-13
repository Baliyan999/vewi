"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Reveal } from "./reveal";
import { MouseTilt, FloatingOrnaments, ParallaxY } from "./parallax";

const ITEMS = [
  { value: 350, suffix: "+", label: "свадеб собрано" },
  { value: 180_000, suffix: "+", label: "кадров от гостей" },
  { value: 96, suffix: "%", label: "молодожёнов рекомендуют" },
] as const;

export function Stats() {
  return (
    <section className="relative overflow-hidden py-20 md:py-24">
      <FloatingOrnaments count={14} />

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-3xl">
          <MouseTilt intensity={5}>
            <div
              className="surface-card relative overflow-hidden rounded-(--radius-xl) p-10 md:p-14"
              style={{ transform: "translateZ(0)" }}
            >
              <ParallaxY strength={0.18}>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-(--color-champagne)/50 blur-3xl"
                />
              </ParallaxY>
              <ParallaxY strength={-0.22}>
                <div
                  aria-hidden
                  className="pointer-events-none absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-(--color-rose)/40 blur-3xl"
                />
              </ParallaxY>

              <div
                className="relative grid gap-10 md:grid-cols-3"
                style={{ transform: "translateZ(20px)" }}
              >
                {ITEMS.map((it) => (
                  <div key={it.label} className="text-center md:text-left">
                    <Counter to={it.value} suffix={it.suffix} />
                    <p className="mt-2 text-sm text-(--color-muted-foreground)">
                      {it.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </MouseTilt>
        </Reveal>
      </div>
    </section>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
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
    <motion.span
      ref={ref}
      className="block font-display text-5xl md:text-6xl text-gradient-gold"
    >
      {n.toLocaleString("ru-RU")}
      {suffix}
    </motion.span>
  );
}
