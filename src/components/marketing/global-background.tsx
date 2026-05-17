"use client";

import { useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * GlobalBackground — a single fixed-position canvas that lives behind every
 * section of the marketing page. Because it sits outside the document flow
 * (position: fixed) it never participates in section layout, so it can be
 * heavily animated without ever creating a per-section seam or transition.
 *
 * Layers (back-to-front):
 *
 *   1. Aurora orbs (4×)
 *      Large soft blur orbs in warm hues — rose, champagne, accent, gold.
 *      Each drifts on its own slow CSS keyframe loop (18-32s) so they
 *      breathe even at rest. Scroll-Y also nudges them, different amounts
 *      and directions per orb, so the page feels alive during scroll.
 *
 *   2. Cursor halo
 *      A 600px soft rose halo that spring-follows the pointer page-wide.
 *      Low stiffness so it drifts behind the cursor rather than snapping —
 *      reads as a gentle warmth following the user's attention. Single
 *      element, not per-section, so no transitions.
 *
 *   3. Parallax stars (35×)
 *      Tiny twinkling dots in two depth layers (depth 0.4 + 0.8). Each
 *      layer drifts horizontally based on mouse X * depth, so the
 *      shallower layer moves less than the deeper one (parallax). Each
 *      star also pulses opacity via random-delayed CSS animation.
 *
 *   4. Scroll-driven hue veil
 *      A single radial-gradient that slowly migrates across the viewport
 *      as the user scrolls: starts top-left rose, ends bottom-right
 *      champagne. Adds a subtle "journey through the day" feel without
 *      ever creating a hard transition line.
 *
 * All layers are pointer-events:none and z-index:-10, behind everything.
 * Reduced-motion users see a static fallback.
 */
export function GlobalBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // ── Mouse tracking ──────────────────────────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Two springs at different stiffness — the cursor halo lags more than
  // the parallax stars, so they don't look like they're glued together.
  const haloX = useSpring(mx, { stiffness: 40, damping: 22, mass: 1.2 });
  const haloY = useSpring(my, { stiffness: 40, damping: 22, mass: 1.2 });
  const starsX = useSpring(mx, { stiffness: 90, damping: 28, mass: 0.8 });
  const starsY = useSpring(my, { stiffness: 90, damping: 28, mass: 0.8 });

  useEffect(() => {
    if (reduce) return;
    // Initial position at viewport centre so the halo isn't stuck in
    // the top-left corner before the first mouse event.
    mx.set(window.innerWidth / 2);
    my.set(window.innerHeight / 2);
    function onMove(e: PointerEvent) {
      mx.set(e.clientX);
      my.set(e.clientY);
    }
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduce]);

  // ── Scroll-driven motion ───────────────────────────────────────────
  // Each orb drifts a different amount as scroll progresses; combined
  // with the CSS-keyframe orbit each gets, motion never feels mechanical.
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const orb4Y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  // Hue veil position migrates from top-left (rose tinted) at progress 0
  // to bottom-right (champagne tinted) at progress 1.
  const veilX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const veilY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Star-layer mouse parallax — derive each layer's offset from the
  // spring-smoothed mouse position, scaled by the layer's depth.
  // Subtract viewport-centre offset so the rest position is (0,0)
  // rather than (vw/2, vh/2).
  const starsLayer1X = useTransform(
    starsX,
    (x) => (x - (typeof window !== "undefined" ? window.innerWidth / 2 : 0)) * -0.018,
  );
  const starsLayer1Y = useTransform(
    starsY,
    (y) => (y - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) * -0.018,
  );
  const starsLayer2X = useTransform(
    starsX,
    (x) => (x - (typeof window !== "undefined" ? window.innerWidth / 2 : 0)) * -0.04,
  );
  const starsLayer2Y = useTransform(
    starsY,
    (y) => (y - (typeof window !== "undefined" ? window.innerHeight / 2 : 0)) * -0.04,
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* ── Layer 1: Aurora orbs ─────────────────────────────────── */}
      {/* Wrapper motion.div carries the scroll-driven Y translate; the
       * inner div carries the CSS-keyframe elliptical drift. Stacking
       * them keeps both transforms alive — Framer Motion's `y` would
       * otherwise overwrite the CSS animation's `transform`. */}
      {!reduce && (
        <>
          <motion.div
            style={{ y: orb1Y }}
            className="absolute -left-40 top-[-10%] h-[640px] w-[640px] will-change-transform"
          >
            <div className="animate-orb-drift-a h-full w-full rounded-full bg-(--color-rose)/25 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb2Y }}
            className="absolute -right-48 top-[20%] h-[760px] w-[760px] will-change-transform"
          >
            <div className="animate-orb-drift-b h-full w-full rounded-full bg-(--color-champagne)/30 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb3Y }}
            className="absolute left-[20%] top-[55%] h-[560px] w-[560px] will-change-transform"
          >
            <div className="animate-orb-drift-c h-full w-full rounded-full bg-(--color-accent)/25 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb4Y }}
            className="absolute -right-32 bottom-[-5%] h-[680px] w-[680px] will-change-transform"
          >
            <div className="animate-orb-drift-d h-full w-full rounded-full bg-(--color-primary)/18 blur-3xl" />
          </motion.div>
        </>
      )}

      {/* ── Layer 2: Cursor halo ─────────────────────────────────── */}
      {!reduce && (
        <motion.div
          style={{
            left: haloX,
            top: haloY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="absolute h-[720px] w-[720px] rounded-full bg-(--color-rose)/20 blur-3xl will-change-transform"
        />
      )}

      {/* ── Layer 4: Scroll-driven hue veil ──────────────────────── */}
      {!reduce && (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage:
              "radial-gradient(circle 800px at var(--vx) var(--vy), oklch(85% 0.08 35 / 0.18), transparent 60%)",
            ["--vx" as string]: veilX,
            ["--vy" as string]: veilY,
          }}
        />
      )}

      {/* ── Layer 3: Parallax stars ──────────────────────────────── */}
      <StarLayer
        offsetX={reduce ? null : starsLayer1X}
        offsetY={reduce ? null : starsLayer1Y}
        positions={STAR_POSITIONS_SHALLOW}
        hueBase={30}
      />
      <StarLayer
        offsetX={reduce ? null : starsLayer2X}
        offsetY={reduce ? null : starsLayer2Y}
        positions={STAR_POSITIONS_DEEP}
        hueBase={55}
      />
    </div>
  );
}

// ── Star positions (deterministic so SSR / hydration matches) ────────
// Two layers at different depths. Each star: x/y in viewport %, size px,
// and a delay (0–6s) used to stagger the twinkle animation phase.
type StarPos = {
  x: number;
  y: number;
  size: number;
  delay: number;
};

const STAR_POSITIONS_SHALLOW: StarPos[] = [
  { x: 8, y: 12, size: 3, delay: 0.0 },
  { x: 18, y: 28, size: 2, delay: 1.4 },
  { x: 32, y: 8, size: 4, delay: 2.6 },
  { x: 46, y: 22, size: 3, delay: 3.8 },
  { x: 58, y: 14, size: 2, delay: 5.1 },
  { x: 72, y: 26, size: 3, delay: 0.9 },
  { x: 86, y: 10, size: 4, delay: 2.2 },
  { x: 94, y: 32, size: 2, delay: 3.5 },
  { x: 12, y: 48, size: 3, delay: 4.7 },
  { x: 28, y: 56, size: 2, delay: 1.2 },
  { x: 44, y: 44, size: 4, delay: 2.9 },
  { x: 62, y: 52, size: 3, delay: 4.4 },
  { x: 78, y: 58, size: 2, delay: 0.6 },
  { x: 90, y: 48, size: 3, delay: 1.8 },
  { x: 6, y: 72, size: 4, delay: 3.1 },
  { x: 20, y: 78, size: 2, delay: 4.6 },
  { x: 38, y: 82, size: 3, delay: 0.3 },
  { x: 54, y: 76, size: 4, delay: 2.4 },
  { x: 68, y: 84, size: 2, delay: 3.9 },
  { x: 82, y: 72, size: 3, delay: 5.2 },
];

const STAR_POSITIONS_DEEP: StarPos[] = [
  { x: 14, y: 18, size: 5, delay: 1.1 },
  { x: 36, y: 36, size: 6, delay: 3.2 },
  { x: 64, y: 16, size: 5, delay: 0.4 },
  { x: 88, y: 40, size: 6, delay: 2.7 },
  { x: 22, y: 60, size: 5, delay: 4.5 },
  { x: 48, y: 68, size: 6, delay: 1.6 },
  { x: 74, y: 64, size: 5, delay: 3.0 },
  { x: 10, y: 88, size: 6, delay: 0.8 },
  { x: 32, y: 92, size: 5, delay: 2.1 },
  { x: 56, y: 88, size: 6, delay: 4.0 },
  { x: 78, y: 90, size: 5, delay: 5.5 },
  { x: 94, y: 76, size: 6, delay: 1.9 },
  { x: 4, y: 32, size: 5, delay: 3.6 },
  { x: 42, y: 4, size: 6, delay: 4.8 },
  { x: 70, y: 38, size: 5, delay: 0.2 },
];

function StarLayer({
  offsetX,
  offsetY,
  positions,
  hueBase,
}: {
  offsetX: MotionValue<number> | null;
  offsetY: MotionValue<number> | null;
  positions: StarPos[];
  hueBase: number;
}) {
  return (
    <motion.div
      className="absolute inset-0 will-change-transform"
      style={offsetX && offsetY ? { x: offsetX, y: offsetY } : undefined}
    >
      {positions.map((p, i) => (
        <span
          key={i}
          className="animate-star-twinkle absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: `radial-gradient(circle, oklch(85% 0.08 ${hueBase}), oklch(72% 0.12 ${hueBase + 20}) 70%, transparent 100%)`,
            boxShadow: `0 0 ${p.size * 3}px oklch(80% 0.1 ${hueBase + 10} / 0.5)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </motion.div>
  );
}
