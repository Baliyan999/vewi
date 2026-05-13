"use client";

import {
  createContext,
  useContext,
  useRef,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/**
 * Scroll-driven Y translate.
 *
 * `strength` — how much the layer drifts. Small values (0.05–0.4) look classy;
 * negative goes up (slower than scroll), positive goes down (faster).
 */
export function ParallaxY({
  children,
  strength = 0.15,
  className,
  style,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${strength * 100}%`, `${-strength * 100}%`],
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...style, y: reduce ? 0 : y }}
    >
      {children}
    </motion.div>
  );
}

/**
 * 3D mouse-tilt panel. Spring keeps movement gentle.
 */
export function MouseTilt({
  children,
  intensity = 8,
  className,
  perspective = 1000,
  style,
}: {
  children: ReactNode;
  intensity?: number;
  className?: string;
  perspective?: number;
  style?: CSSProperties;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rx = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: 180,
    damping: 18,
  });
  const ry = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: 180,
    damping: 18,
  });
  const reduce = useReducedMotion();

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{
        ...style,
        rotateX: rx,
        rotateY: ry,
        transformPerspective: perspective,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- Pointer scene (depth-layered mouse parallax) --------------------------

type PointerCtxValue = {
  x: MotionValue<number>;
  y: MotionValue<number>;
  range: number;
};
const PointerCtx = createContext<PointerCtxValue | null>(null);

export function PointerParallaxScene({
  children,
  className,
  range = 30,
  style,
}: {
  children: ReactNode;
  className?: string;
  range?: number;
  style?: CSSProperties;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const reduce = useReducedMotion();

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <PointerCtx.Provider value={{ x, y, range }}>
      <div
        className={className}
        onMouseMove={onMove}
        onMouseLeave={reset}
        style={{ position: "relative", ...style }}
      >
        {children}
      </div>
    </PointerCtx.Provider>
  );
}

export function PointerLayer({
  depth = 0.5,
  children,
  className,
  style,
}: {
  depth?: number;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ctx = useContext(PointerCtx);
  const fallbackX = useMotionValue(0);
  const fallbackY = useMotionValue(0);
  const sourceX = ctx?.x ?? fallbackX;
  const sourceY = ctx?.y ?? fallbackY;
  const range = ctx?.range ?? 0;

  const xSpring = useSpring(
    useTransform(sourceX, [-0.5, 0.5], [-range * depth, range * depth]),
    { stiffness: 120, damping: 22 },
  );
  const ySpring = useSpring(
    useTransform(sourceY, [-0.5, 0.5], [-range * depth, range * depth]),
    { stiffness: 120, damping: 22 },
  );

  return (
    <motion.div
      className={className}
      style={{ ...style, x: xSpring, y: ySpring }}
    >
      {children}
    </motion.div>
  );
}

// --- Floating ornaments drifting on scroll --------------------------------

export function FloatingOrnaments({
  count = 12,
  className,
  hueBase = 30,
  hueSpread = 50,
}: {
  count?: number;
  className?: string;
  hueBase?: number;
  hueSpread?: number;
}) {
  const items = Array.from({ length: count }, (_, i) => i);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {items.map((i) => {
        const seed = (i * 9301 + 49297) % 233280;
        const rand = seed / 233280;
        const left = (rand * 100).toFixed(1);
        const top = (((seed * 7) % 233280) / 233280 * 100).toFixed(1);
        const depth = 0.15 + (i % 5) * 0.12;
        const size = 6 + (i % 4) * 4;
        const hue = hueBase + ((i * 13) % hueSpread);
        return (
          <FloatBit
            key={i}
            progress={scrollYProgress}
            depth={depth}
            disabled={reduce ?? false}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle at 30% 30%, oklch(95% 0.04 ${hue}), oklch(80% 0.08 ${hue}) 70%, transparent 100%)`,
              filter: "blur(0.5px)",
              opacity: 0.55,
            }}
          />
        );
      })}
    </div>
  );
}

function FloatBit({
  progress,
  depth,
  disabled,
  style,
}: {
  progress: MotionValue<number>;
  depth: number;
  disabled: boolean;
  style: CSSProperties;
}) {
  const y = useTransform(progress, [0, 1], [`${depth * 160}px`, `${-depth * 160}px`]);
  return <motion.span style={{ ...style, y: disabled ? 0 : y }} />;
}

/**
 * Drifting blur orbs. Slower and more dramatic than the small ornaments —
 * good for section backdrops.
 */
export function DriftingOrbs({
  className,
  variant = "rose",
}: {
  className?: string;
  variant?: "rose" | "champagne" | "mix";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], ["-15%", "25%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["20%", "-30%"]);
  const y3 = useTransform(scrollYProgress, [0, 1], ["-10%", "40%"]);

  const colors =
    variant === "rose"
      ? ["oklch(85% 0.07 25 / 0.55)", "oklch(90% 0.05 50 / 0.45)", "oklch(88% 0.05 35 / 0.5)"]
      : variant === "champagne"
        ? ["oklch(92% 0.05 85 / 0.55)", "oklch(88% 0.045 75 / 0.5)", "oklch(95% 0.03 70 / 0.45)"]
        : ["oklch(85% 0.07 25 / 0.5)", "oklch(92% 0.05 85 / 0.5)", "oklch(88% 0.06 50 / 0.45)"];

  return (
    <div
      ref={ref}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      <motion.div
        style={{
          y: reduce ? 0 : y1,
          background: colors[0],
        }}
        className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: reduce ? 0 : y2, background: colors[1] }}
        className="absolute right-0 top-1/3 h-[420px] w-[420px] rounded-full blur-3xl"
      />
      <motion.div
        style={{ y: reduce ? 0 : y3, background: colors[2] }}
        className="absolute -right-20 bottom-0 h-[480px] w-[480px] rounded-full blur-3xl"
      />
    </div>
  );
}
