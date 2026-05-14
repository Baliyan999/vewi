"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  easeInOut,
} from "motion/react";
import { FloatingOrnaments } from "./parallax";

/**
 * StickyHeadline — three short phrases that crossfade as the user scrolls
 * past a pinned section. Rebuild notes:
 *
 *   • The accent word is rendered with a SOLID color, not a CSS gradient
 *     clipped to text. background-clip:text + italic Cyrillic descenders
 *     ("р", "д") was an endless yak-shave: even at line-height 3 the
 *     gradient paint area didn't always cover the deepest glyph tips on
 *     some Chrome builds. A solid color paints the entire glyph natively
 *     with no clip-box involved, so the problem disappears entirely.
 *
 *   • Phrase animation is now pure opacity + small Y slide. No blur, no
 *     scale — those were piling complexity without payoff and the blur in
 *     particular added a fraction of perceived blurriness even at rest.
 *
 *   • Sticky pin window math kept: section is 130vh tall, sticky child is
 *     70vh, so progress 0→1 maps exactly onto the 60vh of scroll during
 *     which the pin holds. No trailing empty pinned area, no overshoot.
 */

type Phrase = { before: string; accent: string; after?: string };

const PHRASES: readonly Phrase[] = [
  { before: "Каждый", accent: "кадр" },
  { before: "от", accent: "каждого", after: "гостя" },
  { before: "в", accent: "одном", after: "альбоме" },
] as const;

export function StickyHeadline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "start -60%"],
  });

  return (
    <section ref={ref} className="relative" style={{ height: "130vh" }}>
      <div className="sticky top-0 flex h-[70vh] items-center justify-center overflow-x-clip">
        <FloatingOrnaments count={20} hueBase={25} hueSpread={70} />

        <div className="container-page relative text-center">
          {PHRASES.map((phrase, i) => (
            <PhraseLine
              key={i}
              index={i}
              total={PHRASES.length}
              progress={scrollYProgress}
              reduce={reduce ?? false}
              phrase={phrase}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhraseLine({
  index,
  total,
  progress,
  reduce,
  phrase,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduce: boolean;
  phrase: Phrase;
}) {
  const span = 1 / total;
  const start = index * span;
  const end = start + span;
  const isFirst = index === 0;

  // 20% enter / 60% hold / 20% exit, with ease-in-out S-curve.
  const ENTER = span * 0.2;
  const EXIT = span * 0.2;
  const inputs = isFirst
    ? [end - EXIT, end]
    : [start, start + ENTER, end - EXIT, end];
  const easeOpts = { ease: easeInOut };

  const opacity = useTransform<number, number>(
    progress,
    inputs,
    isFirst ? [1, 0] : [0, 1, 1, 0],
    easeOpts,
  );
  const y = useTransform<number, number>(
    progress,
    inputs,
    isFirst ? [0, -24] : [24, 0, 0, -24],
    easeOpts,
  );

  return (
    <motion.h2
      style={{
        opacity: reduce ? (index === 1 ? 1 : 0) : opacity,
        y: reduce ? 0 : y,
      }}
      className="absolute inset-x-0 mx-auto font-display text-5xl leading-tight md:text-7xl lg:text-8xl"
    >
      <span className="text-(--color-foreground)">{phrase.before}</span>{" "}
      <span className="italic font-medium text-(--color-primary)">
        {phrase.accent}
      </span>
      {phrase.after ? (
        <>
          {" "}
          <span className="text-(--color-foreground)">{phrase.after}</span>
        </>
      ) : null}
    </motion.h2>
  );
}
