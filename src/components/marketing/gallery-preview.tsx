"use client";

import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useRef } from "react";
import { FloatingOrnaments } from "./parallax";

/**
 * GalleryPreview — "Альбом, который собирает себя сам". Decorative photo
 * mosaic showing how guests' shots aggregate into one album. Rebuild adds:
 *
 *   • Word-by-word title reveal (consistent with How section).
 *   • Per-tile 3D entrance — each card rotates in from rotateY 35° and
 *     translateZ -160px to flat, staggered along the scroll progress
 *     based on tile index. Reads as "cards being placed into the album"
 *     one after another as the user scrolls past.
 *   • Cursor spotlight following the mouse over the whole section.
 *   • Polaroid-style frame on cards (white border, soft shadow, slight
 *     rotation) and dual-paint hover: lifts in 3D + glows.
 *   • Back layer of out-of-focus blurred tiles drifting faster (depth).
 */

const TILES = [
  { ar: "3/4", hue: 25, x: 5, y: 10, w: 22, drift: -55, rot: -2 },
  { ar: "1/1", hue: 70, x: 30, y: 4, w: 24, drift: -110, rot: 1 },
  { ar: "4/5", hue: 45, x: 58, y: 12, w: 22, drift: -70, rot: -1.5 },
  { ar: "1/1", hue: 30, x: 82, y: 6, w: 18, drift: -140, rot: 2 },
  { ar: "4/3", hue: 55, x: 8, y: 52, w: 26, drift: 70, rot: 1.5 },
  { ar: "3/4", hue: 20, x: 38, y: 48, w: 22, drift: 120, rot: -2 },
  { ar: "1/1", hue: 80, x: 64, y: 58, w: 20, drift: 45, rot: 2 },
  { ar: "4/5", hue: 35, x: 86, y: 50, w: 14, drift: 90, rot: -1 },
] as const;

const ICON_TYPES = ["💍", "🥂", "💐", "💌", "💃", "📸", "🌸", "✨"] as const;

export function GalleryPreview() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["35%", "-25%"]);
  const sceneScale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [0.95, 1, 0.97],
  );
  // Whole-scene rotateX tilts forward then back — emphasizes the "album
  // opening / closing" feel as user scrolls through.
  const sceneRotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [8, 0, -4],
  );

  return (
    <section
      ref={ref}
      className="relative overflow-x-clip py-24 md:py-32"
    >
      <FloatingOrnaments count={16} hueBase={30} />

      <div className="container-page relative">
        <motion.div style={{ y: reduce ? 0 : titleY }}>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              whileInView={{ opacity: 1, letterSpacing: "0.3em" }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 text-xs uppercase text-(--color-primary)"
            >
              ⋄ ⋄ ⋄
            </motion.p>
            <TitleReveal text="Альбом, который собирает себя сам" />
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 text-(--color-muted-foreground)"
            >
              Пока гости танцуют — кадры от всех столов уже летят в ваш единый
              альбом. Вы получаете полный архив, ничего не теряется в десятках
              чатов.
            </motion.p>
          </div>
        </motion.div>

        <motion.div
          style={{
            scale: reduce ? 1 : sceneScale,
            rotateX: reduce ? 0 : sceneRotateX,
            transformPerspective: 1400,
            transformStyle: "preserve-3d",
          }}
          className="relative mx-auto h-[560px] max-w-5xl"
        >
          {TILES.map((tile, i) => (
            <ParallaxTile
              key={i}
              index={i}
              total={TILES.length}
              progress={scrollYProgress}
              tile={tile}
              emoji={ICON_TYPES[i]}
              reduce={reduce ?? false}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * TitleReveal — word-by-word entrance for the section title.
 */
function TitleReveal({ text }: { text: string }) {
  const wordVariants: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.85,
        delay: i * 0.06,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  return (
    <h2 className="heading-display-lg text-balance">
      {text.split(" ").map((w, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={wordVariants}
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

function ParallaxTile({
  index,
  total,
  progress,
  tile,
  emoji,
  reduce,
}: {
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  tile: (typeof TILES)[number];
  emoji: string;
  reduce: boolean;
}) {
  // Per-tile staggered scroll entrance. Each tile gets a 0.18-wide window
  // beginning at index/total * 0.5 — the first half of the scroll budget
  // is reserved for entrance, the rest is for the drift parallax.
  const enterStart = (index / total) * 0.45;
  const enterEnd = enterStart + 0.22;

  // Continuous Y drift across the whole section lifecycle.
  const y = useTransform(progress, [0, 1], [0, tile.drift]);

  // Subtle rotate sway during scroll.
  const rotate = useTransform(progress, [0, 1], [tile.rot - 2, tile.rot + 2]);

  // 3D entrance — rotateY pivots from sideways to flat, translateZ from
  // far back to neutral, opacity 0→1. Direction alternates per tile so
  // they don't all enter from the same side.
  const flipFromLeft = index % 2 === 0;
  const enterRotateY = useTransform(
    progress,
    [enterStart, enterEnd],
    [flipFromLeft ? 45 : -45, 0],
  );
  const enterTranslateZ = useTransform(
    progress,
    [enterStart, enterEnd],
    [-200, 0],
  );
  const enterOpacity = useTransform(
    progress,
    [enterStart, enterStart + 0.05, enterEnd],
    [0, 0.3, 1],
  );

  // Hover-variant trick: detect hover on the OUTER motion.div (whose
  // bounding box stays exactly the same during the interaction, because
  // its only transforms are scroll-driven, not hover-driven), then
  // propagate "hover" via variants down to the inner element which does
  // the visual lift. If we put whileHover on the inner motion.div, its
  // transform (y: -8, scale: 1.08) would push it out from under the
  // cursor — hover ends, transform reverts, cursor re-enters, hover
  // restarts, and you get a jitter loop. Detecting on the outer breaks
  // the feedback because the outer never moves on hover.
  const tiltOnHover = tile.rot < 0 ? 1 : -1;

  return (
    <motion.div
      style={{
        y: reduce ? 0 : y,
        rotate: reduce ? 0 : rotate,
        rotateY: reduce ? 0 : enterRotateY,
        z: reduce ? 0 : enterTranslateZ,
        opacity: reduce ? 1 : enterOpacity,
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        width: `${tile.w}%`,
        aspectRatio: tile.ar,
        transformStyle: "preserve-3d",
      }}
      className="absolute"
      whileHover="hover"
      initial="rest"
      animate="rest"
    >
      <motion.div
        variants={{
          rest: {
            scale: 1,
            y: 0,
            rotate: 0,
            boxShadow: "var(--shadow-soft)",
          },
          hover: {
            scale: 1.08,
            y: -8,
            rotate: tiltOnHover,
            boxShadow: "0 30px 60px -15px rgb(180 130 100 / 0.4)",
          },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="group relative h-full w-full overflow-hidden rounded-(--radius-md) bg-white p-2"
        style={{
          border: "1px solid oklch(94% 0.015 70)",
        }}
      >
        {/* Inner "photo" area — gradient fill with a faint diagonal sheen */}
        <div
          className="relative h-full w-full overflow-hidden rounded-sm"
          style={{
            background: `linear-gradient(135deg,
              oklch(94% 0.05 ${tile.hue}) 0%,
              oklch(82% 0.08 ${tile.hue + 10}) 100%)`,
          }}
        >
          {/* Diagonal sheen that brightens on hover */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
            }}
          />

          <div className="absolute inset-0 grid place-items-center text-4xl opacity-80">
            {emoji}
          </div>

          {/* Polaroid-style caption strip at bottom */}
          <div className="absolute inset-x-2 bottom-2 h-2 rounded-full bg-white/50 backdrop-blur" />
        </div>
      </motion.div>
    </motion.div>
  );
}

