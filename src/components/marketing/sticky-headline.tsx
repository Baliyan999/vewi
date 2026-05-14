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
 * past a pinned section. Each phrase has both a TEXT layer and a VISUAL
 * layer (photo-card composition) that animate together. The visual layout
 * differs per phrase to reinforce the meaning:
 *   1. "Каждый кадр"        → one large photo card  (the moment)
 *   2. "от каждого гостя"   → three fanned cards    (contributions)
 *   3. "в одном альбоме"    → grid of small cards   (the album)
 *
 * Notes:
 *   • Accent word renders with --color-primary, NOT background-clip:text,
 *     to avoid italic Cyrillic descender clipping.
 *   • Animation is opacity + small Y slide, shared by text and visual so
 *     they enter/leave as a single visual unit.
 *   • Pin window is 220vh (section 320vh − sticky child 100vh), so each
 *     of the three phrases gets ~790px of scroll → a single hard swipe
 *     can't cycle through all of them.
 */

type Visual = "single" | "fan" | "grid";
type Phrase = { before: string; accent: string; after?: string; visual: Visual };

const PHRASES: readonly Phrase[] = [
  { before: "Каждый", accent: "кадр", visual: "single" },
  { before: "от", accent: "каждого", after: "гостя", visual: "fan" },
  { before: "в", accent: "одном", after: "альбоме", visual: "grid" },
] as const;

export function StickyHeadline() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    // Sticky child is now h-screen (100vh), section is 320vh → pin
    // window = 220vh (~2380px on a 1080 viewport, ~790px per phrase).
    // Match this with the useScroll offset so progress 0→1 maps onto
    // exactly the pin duration and phrase 3 finishes its fade right as
    // the pin releases.
    offset: ["start start", "start -220%"],
  });

  return (
    <section ref={ref} className="relative" style={{ height: "320vh" }}>
      {/* Sticky child fills the FULL viewport (h-screen). Earlier
          h-[70vh] was too cramped on laptop displays — the big
          heading-display-xl + a tall photo card together overflowed
          the centered area, pushing text up behind the sticky header.
          Now content centers in the full viewport minus header space. */}
      <div className="sticky top-0 h-screen overflow-x-clip">
        <FloatingOrnaments count={20} hueBase={25} hueSpread={70} />

        <div className="container-page relative h-full">
          {/* All three phrases share one stage. Each is absolute inset-0
              inside this wrapper so they stack on top of each other —
              only one is opaque at a time per scroll progress. */}
          {PHRASES.map((p, i) => (
            <PhraseLayer
              key={i}
              index={i}
              total={PHRASES.length}
              progress={scrollYProgress}
              reduce={reduce ?? false}
              phrase={p}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function PhraseLayer({
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

  // 30% enter / 40% hold / 30% exit, ease-in-out for a slow crossfade.
  const ENTER = span * 0.3;
  const EXIT = span * 0.3;
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
    <motion.div
      style={{
        opacity: reduce ? (index === 1 ? 1 : 0) : opacity,
        y: reduce ? 0 : y,
      }}
      // pt-20 reserves space for the sticky header (5rem ≈ 80px tall) so
      // text never hides behind it; justify-center then centers the
      // stack within the remaining viewport area below the header.
      className="absolute inset-0 flex flex-col items-center justify-center gap-8 md:gap-12 pt-20"
    >
      <h2 className="heading-display-xl px-4 text-center">
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
      </h2>

      <PhraseVisual variant={phrase.visual} />
    </motion.div>
  );
}

// --- Visual scenes ---------------------------------------------------------
// Each scene renders an array of "photo cards" — white-bordered tiles with
// a warm gradient inside, simulating wedding snapshots. Easy to swap to
// real <img> sources later.

function PhraseVisual({ variant }: { variant: Visual }) {
  if (variant === "single") return <VisualSingle />;
  if (variant === "fan") return <VisualFan />;
  return <VisualGrid />;
}

function PhotoCard({
  hue,
  rotate = 0,
  className = "",
  intensity = 0.08,
}: {
  hue: number;
  rotate?: number;
  className?: string;
  intensity?: number;
}) {
  return (
    <div
      className={`relative rounded-2xl bg-white p-2 shadow-(--shadow-soft) ${className}`}
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <div
        className="h-full w-full rounded-xl"
        style={{
          background: `linear-gradient(135deg,
            oklch(85% ${intensity} ${hue}) 0%,
            oklch(92% ${intensity * 0.7} ${hue + 25}) 55%,
            oklch(80% ${intensity * 1.3} ${hue - 10}) 100%)`,
        }}
      />
    </div>
  );
}

function VisualSingle() {
  return (
    <div className="relative">
      <PhotoCard
        hue={30}
        rotate={-3}
        intensity={0.1}
        className="h-64 w-52 md:h-80 md:w-64 lg:h-[22rem] lg:w-72"
      />
    </div>
  );
}

function VisualFan() {
  // Five overlapping cards spread across an arc. Center card sits forward;
  // outer cards angle further from the spine. On small screens we tighten
  // both the card sizes and the spread so nothing escapes the viewport.
  const cards = [
    { hue: 15, rot: -18, x: -2.2, z: 1, size: "h-32 w-24 sm:h-44 sm:w-32 md:h-56 md:w-40" },
    { hue: 40, rot: -9, x: -1.05, z: 2, size: "h-36 w-28 sm:h-48 sm:w-36 md:h-60 md:w-44" },
    { hue: 60, rot: 0, x: 0, z: 3, size: "h-40 w-32 sm:h-52 sm:w-40 md:h-64 md:w-48", intensity: 0.1 },
    { hue: 80, rot: 9, x: 1.05, z: 2, size: "h-36 w-28 sm:h-48 sm:w-36 md:h-60 md:w-44" },
    { hue: 100, rot: 18, x: 2.2, z: 1, size: "h-32 w-24 sm:h-44 sm:w-32 md:h-56 md:w-40" },
  ];
  return (
    <div className="relative h-40 w-full max-w-[420px] sm:h-52 md:h-64 md:max-w-[560px]">
      {cards.map((c, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-0"
          style={{
            transform: `translateX(calc(-50% + ${c.x * 42}px))`,
            zIndex: c.z,
          }}
        >
          <PhotoCard
            hue={c.hue}
            rotate={c.rot}
            className={c.size}
            intensity={c.intensity ?? 0.08}
          />
        </div>
      ))}
    </div>
  );
}

function VisualGrid() {
  // 12-card grid in 6 columns — a finished album spread. Each tile is
  // slightly rotated for a "laid out by hand" feel.
  const cards = Array.from({ length: 12 }, (_, i) => ({
    hue: 10 + ((i * 23) % 80),
    rotate: ((i % 4) - 1.5) * 2.5,
  }));
  return (
    <div className="grid w-full max-w-[300px] grid-cols-6 gap-1.5 sm:max-w-[380px] sm:gap-2 md:max-w-[560px] md:gap-3">
      {cards.map((c, i) => (
        <PhotoCard
          key={i}
          hue={c.hue}
          rotate={c.rotate}
          className="aspect-[3/4]"
        />
      ))}
    </div>
  );
}
