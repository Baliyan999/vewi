"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { FloatingOrnaments } from "./parallax";

const PHRASES = [
  "Каждый кадр",
  "от каждого гостя",
  "в одном альбоме",
] as const;

export function StickyHeadline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const orbY = useTransform(scrollYProgress, [0, 1], ["-10%", "20%"]);

  return (
    <section ref={ref} className="relative" style={{ height: "130vh" }}>
      <div className="sticky top-0 flex h-[70vh] items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden
          style={{ y: reduce ? 0 : orbY }}
          className="pointer-events-none absolute inset-0"
        >
          <div className="absolute -left-32 top-1/3 h-[440px] w-[440px] rounded-full bg-(--color-rose)/30 blur-3xl" />
          <div className="absolute -right-24 top-1/4 h-[420px] w-[420px] rounded-full bg-(--color-champagne)/40 blur-3xl" />
          <div className="absolute left-1/2 bottom-0 h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-(--color-accent)/30 blur-3xl" />
        </motion.div>

        <FloatingOrnaments count={20} hueBase={25} hueSpread={70} />

        <div className="container-page relative text-center">
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
  const isFirst = index === 0;

  // First phrase is pre-visible at progress 0 so the pinned section never
  // shows an empty viewport on entry — it just fades out near its end.
  // Subsequent phrases use the full fade-in/out arc.
  const opacity = useTransform(
    progress,
    isFirst
      ? [end - span * 0.3, end]
      : [start, start + span * 0.2, end - span * 0.2, end],
    isFirst ? [1, 0] : [0, 1, 1, 0],
  );
  const scale = useTransform(
    progress,
    isFirst ? [end - span * 0.3, end] : [start, mid, end],
    isFirst ? [1, 1.06] : [0.92, 1, 1.06],
  );
  const blur = useTransform(
    progress,
    isFirst
      ? [end - span * 0.3, end]
      : [start, start + span * 0.25, end - span * 0.25, end],
    isFirst ? ["0px", "8px"] : ["8px", "0px", "0px", "8px"],
  );
  const y = useTransform(
    progress,
    isFirst ? [end - span * 0.3, end] : [start, mid, end],
    isFirst ? [0, -30] : [30, 0, -30],
  );

  const words = children.split(" ");

  return (
    <motion.h2
      style={{
        opacity: reduce ? (index === 1 ? 1 : 0) : opacity,
        scale: reduce ? 1 : scale,
        filter: reduce ? undefined : (blur as unknown as string),
        y: reduce ? 0 : y,
      }}
      className="absolute inset-x-0 mx-auto font-display text-5xl leading-[1.05] md:text-7xl lg:text-8xl"
    >
      {words.map((w, i) => (
        <span key={i} className="mr-[0.3em] inline-block">
          {i === Math.floor(words.length / 2) ? (
            <span className="text-gradient-gold italic">{w}</span>
          ) : (
            w
          )}
        </span>
      ))}
    </motion.h2>
  );
}
