"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Tv, Video, Mic, Hand, ShieldCheck, Send } from "lucide-react";
import { DriftingOrbs, FloatingOrnaments } from "./parallax";

/**
 * Features — "Что внутри". Bento-meets-horizontal-pan layout: the
 * section is tall and sticky-pinned for the duration of its scroll;
 * inside the pin, a horizontal track of bento-sized cards slides
 * leftward as the user scrolls down. Each card has its own width,
 * height and vertical offset so the row reads like a scattered
 * collage instead of a uniform grid.
 *
 * Pin math:
 *   section height        = 220vh
 *   sticky child height   = 100vh
 *   pin scroll budget     = 120vh (~ 1296px on 1080) → driven by
 *                           useScroll offset "start start" → "start -120%"
 *
 * The track's negative translateX is sized so its right edge lands at
 * the viewport's right padding exactly at progress = 1, making the
 * end of the pan feel "settled" rather than left mid-motion.
 */

const ICONS = [Tv, Video, Mic, Hand, ShieldCheck, Send] as const;

// Bento card geometry. Width / height in pixels, with an optional Y
// offset so adjacent cards don't sit on the same baseline. The hue is
// the warm accent tint applied behind the icon.
const TILES = [
  { w: 520, h: 440, offsetY: 0,  hue: 25 }, // 1 — Живой слайдшоу (hero card, biggest)
  { w: 320, h: 380, offsetY: 60, hue: 50 }, // 2 — Видео-поздравления (compact, lifted)
  { w: 360, h: 460, offsetY: 0,  hue: 70 }, // 3 — Голосовая гостевая книга (tall)
  { w: 460, h: 360, offsetY: 80, hue: 35 }, // 4 — Модерация одним свайпом (wide, sunk)
  { w: 340, h: 440, offsetY: 20, hue: 20 }, // 5 — Геофенс и защита
  { w: 380, h: 380, offsetY: 100, hue: 55 }, // 6 — Telegram-бот (sunk)
] as const;

const GAP = 32; // px between cards
const SIDE_PADDING = 80; // px on each side of the track (leading/trailing breathing room)

export function Features() {
  const t = useTranslations("features");
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "start -120%"],
  });

  // Viewport size measured on mount + on resize. Cards scale by
  // viewport HEIGHT so the entire horizontal track fits inside the
  // visible area on any aspect ratio (16:9 was fine, 16:10 was
  // clipping the bottom of the taller cards). Track width is
  // recomputed from the scaled sizes so the horizontal pan distance
  // also adjusts to the new geometry.
  const vwRef = useRef(0);
  const scaleRef = useRef(1);
  const [, setReady] = useState(false);
  useEffect(() => {
    const update = () => {
      vwRef.current = window.innerWidth;
      // Card sizes target 1080-tall viewports. Below that we scale
      // everything down proportionally (clamped to 0.7 so they don't
      // get unreadably small on cramped windows). At 1080+ we keep
      // the full size.
      scaleRef.current = Math.min(
        1,
        Math.max(0.7, window.innerHeight / 1080),
      );
      setReady((r) => !r);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Scale-aware total width — recomputed each transform call so the
  // pan distance always matches the actual rendered card sizes.
  const x = useTransform(scrollYProgress, (v) => {
    const s = scaleRef.current;
    const totalCardWidth = TILES.reduce((sum, t) => sum + t.w * s, 0);
    const trackTotalWidth =
      totalCardWidth + GAP * (TILES.length - 1) + SIDE_PADDING * 2;
    const panDistance = Math.max(0, trackTotalWidth - vwRef.current);
    return -panDistance * v;
  });

  // Eyebrow + title parallax — these sit above the track inside the pin.
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative"
      style={{ height: "220vh" }}
    >
      <div className="sticky top-0 flex h-screen flex-col overflow-x-clip pt-20 pb-8 md:pt-24 md:pb-12">
        <DriftingOrbs variant="mix" />
        <FloatingOrnaments count={14} hueBase={20} hueSpread={70} />

        {/* Title block — stays put while the track pans below it */}
        <motion.div
          style={{ y: reduce ? 0 : titleY }}
          className="relative mx-auto mb-10 max-w-2xl px-6 text-center md:mb-14"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 text-[10px] uppercase text-(--color-primary) sm:text-xs"
          >
            ⋄ ⋄ ⋄
          </motion.p>
          <TitleReveal text={t("title")} className="heading-display-lg mb-4" />
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="text-pretty text-base text-(--color-muted-foreground) sm:text-lg"
          >
            {t("subtitle")}
          </motion.p>
        </motion.div>

        {/* Horizontal track — pans left as user scrolls down */}
        <div className="relative flex-1">
          <motion.div
            style={{
              x: reduce ? 0 : x,
              paddingLeft: SIDE_PADDING,
              paddingRight: SIDE_PADDING,
              gap: GAP,
            }}
            className="flex h-full items-center"
          >
            {TILES.map((tile, i) => (
              <BentoCard
                key={i}
                tile={tile}
                scale={scaleRef.current || 1}
                index={i}
                Icon={ICONS[i]}
                title={t(`f${i + 1}Title` as "f1Title")}
                desc={t(`f${i + 1}Desc` as "f1Desc")}
                reduce={reduce ?? false}
              />
            ))}
          </motion.div>
        </div>

        {/* Scroll progress bar at the bottom of the pinned viewport.
            Mirrors the pan position so the user understands they're
            inside a multi-step horizontal sequence. */}
        {!reduce && (
          <div className="relative mx-auto mt-4 h-[3px] w-40 overflow-hidden rounded-full bg-(--color-border) sm:w-56">
            <motion.div
              style={{
                scaleX: scrollYProgress,
                transformOrigin: "left",
              }}
              className="h-full w-full bg-gradient-to-r from-(--color-primary) via-(--color-rose) to-(--color-champagne)"
            />
          </div>
        )}
      </div>
    </section>
  );
}

/** Word-by-word title reveal. */
function TitleReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const variants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.85,
        delay: i * 0.07,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };
  return (
    <h2 className={className}>
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={variants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          className="mr-[0.25em] inline-block"
        >
          {w}
        </motion.span>
      ))}
    </h2>
  );
}

function BentoCard({
  tile,
  scale,
  index,
  Icon,
  title,
  desc,
  reduce,
}: {
  tile: (typeof TILES)[number];
  scale: number;
  index: number;
  Icon: (typeof ICONS)[number];
  title: string;
  desc: string;
  reduce: boolean;
}) {
  return (
    <motion.div
      whileHover="hover"
      initial="rest"
      animate="rest"
      style={{
        width: tile.w * scale,
        height: tile.h * scale,
        translateY: reduce ? 0 : tile.offsetY * scale,
        flexShrink: 0,
      }}
      className="relative"
    >
      <motion.div
        variants={{
          rest: { y: 0, boxShadow: "var(--shadow-soft)" },
          hover: {
            y: -8,
            boxShadow:
              "0 30px 60px -16px rgb(180 130 100 / 0.4), 0 0 0 1px oklch(92% 0.04 60)",
          },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        className="surface-card group relative flex h-full w-full flex-col overflow-hidden rounded-(--radius-xl) p-6 sm:p-8"
      >
        {/* Per-card hue glow — large blurry orb in the corner */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full opacity-40 blur-3xl transition-opacity duration-500 group-hover:opacity-80"
          style={{ background: `oklch(85% 0.1 ${tile.hue})` }}
        />

        {/* Icon + ordinal — top row, simple and quiet */}
        <div className="relative flex items-start justify-between">
          <motion.div
            variants={{
              rest: { scale: 1, rotate: 0 },
              hover: { scale: 1.06, rotate: -3 },
            }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
            className="grid h-14 w-14 place-items-center rounded-2xl text-(--color-primary)"
            style={{
              background: `linear-gradient(135deg,
                oklch(96% 0.04 ${tile.hue}),
                oklch(88% 0.08 ${tile.hue - 5}))`,
              boxShadow: `0 8px 20px -8px oklch(70% 0.1 ${tile.hue} / 0.45)`,
            }}
          >
            <Icon className="h-7 w-7" strokeWidth={1.5} />
          </motion.div>
          <span
            className="font-display text-3xl text-(--color-muted-foreground)/30"
            aria-hidden
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        {/* Spacer pushes title+desc to the bottom */}
        <div className="flex-1" />

        <motion.h3
          variants={{
            rest: { y: 0 },
            hover: { y: -2 },
          }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="relative mb-2 text-xl md:text-2xl"
        >
          {title}
        </motion.h3>
        <p className="relative text-pretty text-sm leading-relaxed text-(--color-muted-foreground) sm:text-base">
          {desc}
        </p>
      </motion.div>
    </motion.div>
  );
}
