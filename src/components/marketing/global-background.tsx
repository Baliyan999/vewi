"use client";

import { useEffect, useState } from "react";
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
 * GlobalBackground — single fixed-position canvas behind every section.
 *
 * Layers (back-to-front):
 *
 *   0. Conic gradient mesh — slowly rotating warm color wheel, sits at
 *      the very back. The whole page picks up gentle "premium AI"
 *      iridescence as it rotates over ~80 seconds.
 *
 *   1. Aurora orbs (6×) — large soft blur orbs in warm hues, each
 *      carries (a) a scroll-driven Y translate and (b) its own CSS
 *      keyframe elliptical drift. Doubled wrapper so both transforms
 *      coexist.
 *
 *   2. Light rays (4×) — thin diagonal beams that sweep across the
 *      viewport on a 14-22s cycle, like sunlight through clouds.
 *
 *   3. Drifting particles (24×) — small specs that float upward across
 *      the page on a slow continuous CSS loop. Different speeds and
 *      delays so they never align.
 *
 *   4. Twinkling stars (35×, two depth layers) — pulse opacity/scale
 *      and parallax with mouse X/Y at different depths.
 *
 *   5. Cursor halo + 5-dot trail — large rose halo follows the pointer
 *      via spring; a chain of smaller dots trails behind at progressive
 *      lag, like comet exhaust.
 *
 *   6. Scroll-driven hue veil — radial-gradient whose centre migrates
 *      top-left → bottom-right as the user scrolls.
 *
 *   7. Vignette — radial darkening at the corners for cinematic depth.
 *
 * All layers are pointer-events:none and z-index:-10; everything sits
 * behind page content. useReducedMotion disables motion entirely while
 * keeping the static colour wash.
 */
export function GlobalBackground() {
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();

  // Hydration gate (see commit c8c835f for rationale).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // ── Mouse tracking ──────────────────────────────────────────────────
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  // Multiple springs at different stiffnesses for layered lag effects.
  const haloX = useSpring(mx, { stiffness: 40, damping: 22, mass: 1.2 });
  const haloY = useSpring(my, { stiffness: 40, damping: 22, mass: 1.2 });
  const trail1X = useSpring(mx, { stiffness: 80, damping: 25, mass: 1 });
  const trail1Y = useSpring(my, { stiffness: 80, damping: 25, mass: 1 });
  const trail2X = useSpring(mx, { stiffness: 50, damping: 22, mass: 1.1 });
  const trail2Y = useSpring(my, { stiffness: 50, damping: 22, mass: 1.1 });
  const trail3X = useSpring(mx, { stiffness: 30, damping: 20, mass: 1.3 });
  const trail3Y = useSpring(my, { stiffness: 30, damping: 20, mass: 1.3 });
  const starsX = useSpring(mx, { stiffness: 90, damping: 28, mass: 0.8 });
  const starsY = useSpring(my, { stiffness: 90, damping: 28, mass: 0.8 });

  useEffect(() => {
    if (reduce) return;
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
  const orb1Y = useTransform(scrollYProgress, [0, 1], [0, 320]);
  const orb2Y = useTransform(scrollYProgress, [0, 1], [0, -240]);
  const orb3Y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const orb4Y = useTransform(scrollYProgress, [0, 1], [0, -300]);
  const orb5Y = useTransform(scrollYProgress, [0, 1], [0, 260]);
  const orb6Y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  // Conic mesh rotation also slowly drifts with scroll, on top of the
  // CSS keyframe rotation.
  const meshRotate = useTransform(scrollYProgress, [0, 1], [0, 30]);

  // Hue veil centre migrates top-left → bottom-right with scroll.
  const veilX = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const veilY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Star parallax (depth-scaled cursor offset).
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

  // Render an empty wrapper before mount to keep SSR / first client paint
  // identical (no hydration mismatch from window.innerWidth reads).
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      />
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* ── Layer 0: Conic gradient mesh (slow rotation) ─────────── */}
      {/* Outer carries the scroll-driven rotate; inner div carries the
       * CSS keyframe spin so neither transform clobbers the other. */}
      {!reduce && (
        <motion.div
          className="absolute -inset-[20%] will-change-transform"
          style={{ rotate: meshRotate }}
        >
          <div
            className="animate-conic-spin h-full w-full opacity-50"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, " +
                "oklch(86% 0.12 30), " +   // warm rose
                "oklch(92% 0.08 60), " +   // peach
                "oklch(90% 0.1 90), " +    // champagne
                "oklch(88% 0.11 45), " +   // gold
                "oklch(85% 0.12 20), " +   // rose
                "oklch(86% 0.12 30))",      // back to start
              filter: "blur(100px)",
            }}
          />
        </motion.div>
      )}

      {/* ── Layer 1: Aurora orbs (×6) ─────────────────────────────── */}
      {!reduce && (
        <>
          <motion.div
            style={{ y: orb1Y }}
            className="absolute -left-40 top-[-10%] h-[640px] w-[640px] will-change-transform"
          >
            <div className="animate-orb-drift-a h-full w-full rounded-full bg-(--color-rose)/30 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb2Y }}
            className="absolute -right-48 top-[20%] h-[760px] w-[760px] will-change-transform"
          >
            <div className="animate-orb-drift-b h-full w-full rounded-full bg-(--color-champagne)/32 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb3Y }}
            className="absolute left-[20%] top-[55%] h-[560px] w-[560px] will-change-transform"
          >
            <div className="animate-orb-drift-c h-full w-full rounded-full bg-(--color-accent)/28 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb4Y }}
            className="absolute -right-32 bottom-[-5%] h-[680px] w-[680px] will-change-transform"
          >
            <div className="animate-orb-drift-d h-full w-full rounded-full bg-(--color-primary)/20 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb5Y }}
            className="absolute left-[40%] top-[10%] h-[500px] w-[500px] will-change-transform"
          >
            <div className="animate-orb-drift-b h-full w-full rounded-full bg-(--color-rose)/22 blur-3xl" />
          </motion.div>
          <motion.div
            style={{ y: orb6Y }}
            className="absolute left-[-20%] top-[40%] h-[600px] w-[600px] will-change-transform"
          >
            <div className="animate-orb-drift-c h-full w-full rounded-full bg-(--color-champagne)/24 blur-3xl" />
          </motion.div>
        </>
      )}

      {/* ── Layer 2: Light rays (×4) ─────────────────────────────── */}
      {!reduce && <LightRays />}

      {/* ── Layer 3: Drifting particles ──────────────────────────── */}
      {!reduce && <DriftingParticles />}

      {/* ── Layer 6: Scroll-driven hue veil ──────────────────────── */}
      {!reduce && (
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage:
              "radial-gradient(circle 900px at var(--vx) var(--vy), oklch(85% 0.1 35 / 0.22), transparent 60%)",
            ["--vx" as string]: veilX,
            ["--vy" as string]: veilY,
          }}
        />
      )}

      {/* ── Layer 4: Parallax stars ──────────────────────────────── */}
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

      {/* ── Layer 5: Cursor trail (5-dot chain) + main halo ──────── */}
      {!reduce && (
        <>
          {/* Trail dots — each more delayed than the last */}
          <TrailDot x={trail3X} y={trail3Y} size={120} opacity={0.06} hue={30} />
          <TrailDot x={trail2X} y={trail2Y} size={200} opacity={0.08} hue={40} />
          <TrailDot x={trail1X} y={trail1Y} size={340} opacity={0.10} hue={45} />
          {/* Main halo — biggest, freshest, leads the visual */}
          <motion.div
            style={{
              left: haloX,
              top: haloY,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="absolute h-[720px] w-[720px] rounded-full bg-(--color-rose)/22 blur-3xl will-change-transform"
          />
        </>
      )}

      {/* ── Layer 7: Vignette ────────────────────────────────────── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, oklch(60% 0.04 35 / 0.08) 100%)",
        }}
      />
    </div>
  );
}

// ── Cursor trail dot ─────────────────────────────────────────────────
function TrailDot({
  x,
  y,
  size,
  opacity,
  hue,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  size: number;
  opacity: number;
  hue: number;
}) {
  return (
    <motion.div
      style={{
        left: x,
        top: y,
        translateX: "-50%",
        translateY: "-50%",
        width: size,
        height: size,
        background: `radial-gradient(circle, oklch(80% 0.1 ${hue} / ${opacity * 4}), transparent 70%)`,
      }}
      className="absolute rounded-full blur-2xl will-change-transform"
    />
  );
}

// ── Light rays (4 diagonal sweeping beams) ───────────────────────────
function LightRays() {
  // Each ray: rotation angle, animation class, delay. Diagonal beams
  // sweep slowly across viewport on a translateY loop.
  const rays = [
    { rot: 18, className: "animate-light-ray-a", top: "-20%" },
    { rot: -22, className: "animate-light-ray-b", top: "30%" },
    { rot: 12, className: "animate-light-ray-c", top: "55%" },
    { rot: -16, className: "animate-light-ray-d", top: "80%" },
  ];
  return (
    <>
      {rays.map((r, i) => (
        <div
          key={i}
          className={`pointer-events-none absolute left-[-20%] h-[3px] w-[140%] ${r.className} will-change-transform`}
          style={{
            top: r.top,
            transform: `rotate(${r.rot}deg)`,
            background:
              "linear-gradient(90deg, transparent 0%, oklch(95% 0.05 60 / 0.4) 50%, transparent 100%)",
            filter: "blur(3px)",
          }}
        />
      ))}
    </>
  );
}

// ── Drifting particles (slow upward float) ───────────────────────────
const PARTICLE_POSITIONS = [
  { x: 5, size: 3, duration: 24, delay: 0 },
  { x: 12, size: 2, duration: 32, delay: 4 },
  { x: 20, size: 4, duration: 28, delay: 9 },
  { x: 28, size: 2, duration: 36, delay: 14 },
  { x: 35, size: 3, duration: 22, delay: 2 },
  { x: 42, size: 5, duration: 30, delay: 11 },
  { x: 48, size: 2, duration: 26, delay: 18 },
  { x: 54, size: 3, duration: 34, delay: 5 },
  { x: 61, size: 4, duration: 28, delay: 16 },
  { x: 68, size: 2, duration: 22, delay: 8 },
  { x: 74, size: 3, duration: 32, delay: 3 },
  { x: 80, size: 5, duration: 26, delay: 13 },
  { x: 86, size: 2, duration: 30, delay: 6 },
  { x: 92, size: 3, duration: 24, delay: 19 },
  { x: 16, size: 2, duration: 38, delay: 21 },
  { x: 38, size: 4, duration: 28, delay: 7 },
  { x: 58, size: 2, duration: 34, delay: 15 },
  { x: 78, size: 4, duration: 26, delay: 1 },
  { x: 8, size: 3, duration: 36, delay: 17 },
  { x: 32, size: 2, duration: 30, delay: 10 },
  { x: 50, size: 4, duration: 22, delay: 12 },
  { x: 70, size: 3, duration: 32, delay: 20 },
  { x: 88, size: 4, duration: 28, delay: 6 },
  { x: 24, size: 5, duration: 34, delay: 23 },
];

function DriftingParticles() {
  return (
    <>
      {PARTICLE_POSITIONS.map((p, i) => (
        <span
          key={i}
          className="animate-particle-rise pointer-events-none absolute rounded-full will-change-transform"
          style={{
            left: `${p.x}%`,
            bottom: "-20px",
            width: p.size,
            height: p.size,
            background:
              "radial-gradient(circle, oklch(92% 0.06 60), oklch(78% 0.1 40) 70%, transparent 100%)",
            boxShadow: `0 0 ${p.size * 4}px oklch(82% 0.08 45 / 0.6)`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

// ── Star positions (deterministic so SSR / hydration matches) ────────
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
