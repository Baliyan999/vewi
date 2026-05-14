"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { Reveal } from "./reveal";
import { FloatingOrnaments } from "./parallax";

/**
 * Decorative photo mosaic with parallax-drifting tiles + a back layer that
 * drifts at higher speed for depth.
 */
const TILES = [
  { ar: "3/4", hue: 25, x: 5, y: 10, w: 22, drift: -55 },
  { ar: "1/1", hue: 70, x: 30, y: 4, w: 24, drift: -110 },
  { ar: "4/5", hue: 45, x: 58, y: 12, w: 22, drift: -70 },
  { ar: "1/1", hue: 30, x: 82, y: 6, w: 18, drift: -140 },
  { ar: "4/3", hue: 55, x: 8, y: 52, w: 26, drift: 70 },
  { ar: "3/4", hue: 20, x: 38, y: 48, w: 22, drift: 120 },
  { ar: "1/1", hue: 80, x: 64, y: 58, w: 20, drift: 45 },
  { ar: "4/5", hue: 35, x: 86, y: 50, w: 14, drift: 90 },
] as const;

const BACK_TILES = [
  { hue: 70, x: 12, y: 30, w: 16, drift: -200 },
  { hue: 30, x: 70, y: 20, w: 18, drift: -240 },
  { hue: 55, x: 48, y: 76, w: 14, drift: 220 },
  { hue: 25, x: 88, y: 40, w: 12, drift: 180 },
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
  const sceneScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.97]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <div className="pointer-events-none absolute inset-0 opacity-50 blur-sm">
        {BACK_TILES.map((tile, i) => (
          <BackTile key={i} progress={scrollYProgress} tile={tile} reduce={reduce ?? false} />
        ))}
      </div>

      <FloatingOrnaments count={16} hueBase={30} />

      <div className="container-page relative">
        <motion.div style={{ y: reduce ? 0 : titleY }}>
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-(--color-primary)">
              ⋄ ⋄ ⋄
            </p>
            <h2 className="mb-4 text-4xl md:text-5xl">
              Альбом, который собирает себя сам
            </h2>
            <p className="text-(--color-muted-foreground)">
              Пока гости танцуют — кадры от всех столов уже летят в ваш единый альбом.
              Вы получаете полный архив, ничего не теряется в десятках чатов.
            </p>
          </Reveal>
        </motion.div>

        <motion.div
          style={{ scale: reduce ? 1 : sceneScale }}
          className="relative mx-auto h-[560px] max-w-5xl"
        >
          {TILES.map((tile, i) => (
            <ParallaxTile
              key={i}
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

function ParallaxTile({
  progress,
  tile,
  emoji,
  reduce,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  tile: (typeof TILES)[number];
  emoji: string;
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, tile.drift]);
  const rotate = useTransform(progress, [0, 1], [-2, 2]);
  return (
    <motion.div
      style={{
        y: reduce ? 0 : y,
        rotate: reduce ? 0 : rotate,
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        width: `${tile.w}%`,
        aspectRatio: tile.ar,
      }}
      className="absolute"
    >
      <motion.div
        whileHover={{ scale: 1.06, rotate: -2, zIndex: 30 }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        className="relative h-full w-full overflow-hidden rounded-(--radius-md) shadow-(--shadow-soft)"
        style={{
          background: `linear-gradient(135deg,
            oklch(94% 0.05 ${tile.hue}) 0%,
            oklch(82% 0.08 ${tile.hue + 10}) 100%)`,
          border: "1px solid oklch(95% 0.015 70)",
        }}
      >
        <div className="absolute inset-0 grid place-items-center text-4xl opacity-70 mix-blend-multiply">
          {emoji}
        </div>
        <div className="absolute inset-x-2 bottom-2 h-3 rounded-sm bg-white/40 backdrop-blur" />
      </motion.div>
    </motion.div>
  );
}

function BackTile({
  progress,
  tile,
  reduce,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  tile: (typeof BACK_TILES)[number];
  reduce: boolean;
}) {
  const y = useTransform(progress, [0, 1], [0, tile.drift]);
  return (
    <motion.div
      style={{
        y: reduce ? 0 : y,
        left: `${tile.x}%`,
        top: `${tile.y}%`,
        width: `${tile.w}%`,
        aspectRatio: "1/1",
        background: `linear-gradient(135deg, oklch(92% 0.05 ${tile.hue}), oklch(75% 0.09 ${tile.hue + 8}))`,
      }}
      className="absolute rounded-(--radius-md)"
    />
  );
}
