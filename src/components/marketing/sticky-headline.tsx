"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";

const PHRASES = ["Every frame.", "From every guest.", "In one album."] as const;

/**
 * Tall pinned section. As you scroll, three editorial statements cross-fade
 * with a soft scale shift. Replaces the rich Stitch hero language patterns
 * in the demo (Дмитрий, Stitch-y phrases) with VEWI's English-first cadence.
 */
export function StickyHeadline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={ref} className="relative" style={{ height: "260vh" }}>
      <div className="sticky top-0 flex h-dvh items-center justify-center overflow-hidden">
        <div className="container-page text-center">
          {PHRASES.map((phrase, i) => (
            <Phrase
              key={i}
              index={i}
              total={PHRASES.length}
              progress={scrollYProgress}
              reduce={reduce ?? false}
            >
              {phrase}
            </Phrase>
          ))}

          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]),
            }}
            className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 label-caps text-[color:var(--color-on-surface-variant)]"
          >
            ↓  Scroll  ↓
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Phrase({
  index,
  total,
  progress,
  reduce,
  children,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
  children: string;
}) {
  const span = 1 / total;
  const start = index * span;
  const end = start + span;
  const mid = (start + end) / 2;

  const opacity = useTransform(
    progress,
    [start, start + span * 0.18, end - span * 0.18, end],
    [0, 1, 1, 0],
  );
  const scale = useTransform(progress, [start, mid, end], [0.95, 1, 1.04]);
  const y = useTransform(progress, [start, mid, end], [20, 0, -20]);

  return (
    <motion.h2
      style={{
        opacity: reduce ? (index === 1 ? 1 : 0) : opacity,
        scale: reduce ? 1 : scale,
        y: reduce ? 0 : y,
      }}
      className="absolute inset-x-0 mx-auto text-display-md md:text-display-lg leading-[1.05] text-[color:var(--color-on-surface)] tracking-tight"
    >
      <span className="italic font-light">{children}</span>
    </motion.h2>
  );
}
