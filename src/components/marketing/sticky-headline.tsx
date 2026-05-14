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
    // sticky pin lives from section.top hitting viewport.top (start start)
    // until section.top is `(section_height − child_height) = 60vh` above
    // viewport.top. Map useScroll progress 0→1 onto that pin window exactly
    // so the three phrases finish their cross-fade right as the pin
    // releases — no trailing empty pinned area.
    offset: ["start start", "start -60%"],
  });

  return (
    <section ref={ref} className="relative" style={{ height: "130vh" }}>
      <div className="sticky top-0 flex h-[70vh] items-center justify-center overflow-hidden">
        {/* Decorative blur orbs removed — they were bounded by the 70vh
         * sticky child and created a visible horizontal seam where their
         * coverage ended. The body's continuous linear wash now provides
         * all the ambient warmth. */}
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
  const isFirst = index === 0;

  // Each phrase glides into place over ~20% of its span via an ease-in-out
  // curve, holds at center for ~60%, then glides out in the final ~20%.
  // The longer fades + S-curve easing make the transition feel buttery
  // instead of stepped.
  const ENTER = span * 0.2;
  const EXIT = span * 0.2;
  const inputs = isFirst
    ? [end - EXIT, end]
    : [start, start + ENTER, end - EXIT, end];

  // Apply ease-in-out across every segment of the transform so each fade
  // follows an S-curve — slow start, fast middle, slow end — instead of
  // a linear sweep. A single function is interpreted as "use this for all
  // segments" by motion, and the flat hold zone in the middle remains flat
  // because both ends of that segment have the same output value.
  const easeOpts = { ease: easeInOut };

  const opacity = useTransform<number, number>(
    progress,
    inputs,
    isFirst ? [1, 0] : [0, 1, 1, 0],
    easeOpts,
  );
  const scale = useTransform<number, number>(
    progress,
    inputs,
    isFirst ? [1, 1.06] : [0.92, 1, 1, 1.06],
    easeOpts,
  );
  const blur = useTransform(
    progress,
    inputs,
    isFirst ? ["0px", "8px"] : ["8px", "0px", "0px", "8px"],
    easeOpts,
  );
  const y = useTransform<number, number>(
    progress,
    inputs,
    isFirst ? [0, -30] : [30, 0, 0, -30],
    easeOpts,
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
      className="absolute inset-x-0 mx-auto font-display text-5xl leading-[1.2] py-2 md:text-7xl lg:text-8xl"
    >
      {words.map((w, i) => (
        <span key={i} className="mr-[0.3em] inline-block">
          {i === Math.floor(words.length / 2) ? (
            // background-clip:text paints the gradient inside the padding-box.
            // Italic Cyrillic descenders ("р", "д", "ц") poke below it, so
            // those bits render transparent and look "cut". inline-block +
            // py-[0.18em] grows the box just enough to cover the full glyph.
            <span
              className="text-gradient-gold italic inline-block leading-[1.4]"
              style={{
                paddingBlock: "0.35em",
                marginBlock: "-0.35em",
              }}
            >
              {w}
            </span>
          ) : (
            w
          )}
        </span>
      ))}
    </motion.h2>
  );
}
