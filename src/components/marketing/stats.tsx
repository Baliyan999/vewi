"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useReducedMotion,
  useSpring,
} from "motion/react";
import { MouseTilt, FloatingOrnaments, ParallaxY } from "./parallax";

/**
 * Honest product-promise numbers (NOT adoption metrics — we just launched).
 * Each value reflects something real the couple receives from the service,
 * mirroring the tariff lines further down the page.
 */
const ITEMS = [
  { prefix: "до ", value: 30, suffix: "", label: "кадров от каждого гостя" },
  { prefix: "до ", value: 15, suffix: "", label: "секунд на видео-привет" },
  { prefix: "до ", value: 6, suffix: "", label: "месяцев храним архив" },
] as const;

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  // Ballistic arc across the viewport: card flies in from off-screen lower-left,
  // briefly settles at center, then drifts out toward the upper-right as the
  // user scrolls past. The 4-stop transforms create a built-in "linger" zone
  // between 0.4 and 0.6 so the numbers stay legible long enough to read.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    // Tightened from "start end" → "end start" to "start 75%" → "end 25%"
    // so the arc plays out in ~50vh of scroll instead of the whole lifecycle.
    // The user reaches the next section much sooner.
    offset: ["start 75%", "end 25%"],
  });
  const xRaw = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    ["-130%", "0%", "0%", "140%"],
  );
  const x = useSpring(xRaw, { stiffness: 120, damping: 26, mass: 0.6 });

  // Rotation curls: -6° on entry → 0° at rest → +9° as it tumbles out.
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [-6, 0, 0, 9],
  );

  // Y describes the arc — comes up from below, peaks flat at centre, then
  // arcs upward as it exits (parabolic feel without a real physics sim).
  const y = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [50, 0, 0, -90],
  );

  // Fade in/out at the lifecycle edges, full visible across the middle 70%.
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.15, 0.85, 1],
    [0, 1, 1, 0],
  );

  // Scale: grows into place, shrinks slightly as it leaves so it feels like
  // it's actually receding rather than just sliding off.
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.6, 1],
    [0.9, 1, 1, 0.82],
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-x-clip py-8 md:py-12"
    >
      <FloatingOrnaments count={14} />

      <div className="container-page relative">
        <motion.div
          style={
            reduce
              ? undefined
              : { x, rotate, opacity, scale }
          }
          className="mx-auto max-w-3xl will-change-transform"
        >
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
                className="relative grid gap-10 md:grid-cols-3 md:items-stretch"
                style={{ transform: "translateZ(20px)" }}
              >
                {ITEMS.map((it) => (
                  <div
                    key={it.label}
                    className="flex h-full flex-col text-center md:text-left"
                  >
                    <Counter prefix={it.prefix} to={it.value} suffix={it.suffix} />
                    <p className="mt-auto pt-4 text-sm text-(--color-muted-foreground)">
                      {it.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </MouseTilt>
        </motion.div>
      </div>
    </section>
  );
}

function Counter({
  to,
  suffix = "",
  prefix = "",
}: {
  to: number;
  suffix?: string;
  prefix?: string;
}) {
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
      {prefix}
      {n.toLocaleString("ru-RU")}
      {suffix}
    </motion.span>
  );
}
