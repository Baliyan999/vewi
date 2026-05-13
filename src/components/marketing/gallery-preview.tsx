"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { useRef } from "react";
import { FilmStrip } from "@/components/ui/film-strip";

/**
 * Editorial mosaic preview. Decorative tiles drift on scroll for parallax.
 * Real wedding imagery would replace the gradient placeholders.
 */
const TILES = [
  { hue: 35, x: 5, y: 10, w: 24, h: 280, drift: -50 },
  { hue: 60, x: 32, y: 4, w: 22, h: 220, drift: -90 },
  { hue: 25, x: 56, y: 12, w: 26, h: 320, drift: -65 },
  { hue: 70, x: 8, y: 50, w: 28, h: 240, drift: 70 },
  { hue: 45, x: 38, y: 46, w: 22, h: 200, drift: 100 },
  { hue: 30, x: 62, y: 52, w: 24, h: 260, drift: 50 },
] as const;

export function GalleryPreview() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <>
      <div className="container-page">
        <FilmStrip />
      </div>

      <section
        ref={ref}
        className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) py-(--space-section) bg-[color:var(--color-surface-container)]/30"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <h2 className="text-headline-md text-[color:var(--color-on-surface)] mb-4">
            Альбом, который собирает себя сам
          </h2>
          <p className="text-body-md">
            Каждый кадр от каждого гостя — в едином кураторском архиве. Вы получаете
            всё, что увидели глаза вашей свадьбы.
          </p>
        </motion.div>

        <div className="relative h-[500px] max-w-5xl mx-auto hidden md:block">
          {TILES.map((tile, i) => (
            <Tile key={i} progress={scrollYProgress} tile={tile} reduce={reduce ?? false} />
          ))}
        </div>

        {/* Mobile: simple film-strip stack */}
        <div className="md:hidden grid grid-cols-2 gap-2">
          {TILES.slice(0, 4).map((t, i) => (
            <div
              key={i}
              className="border-[0.5px] border-[color:var(--color-outline-variant)] aspect-[3/4]"
              style={{
                background: `linear-gradient(135deg, oklch(94% 0.05 ${t.hue}), oklch(78% 0.09 ${t.hue + 12}))`,
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function Tile({
  progress,
  tile,
  reduce,
}: {
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  tile: (typeof TILES)[number];
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
        height: tile.h,
        background: `linear-gradient(135deg, oklch(94% 0.05 ${tile.hue}), oklch(78% 0.09 ${tile.hue + 12}))`,
      }}
      className="absolute border-[0.5px] border-[color:var(--color-outline-variant)]"
    />
  );
}
