"use client";

import { motion, useReducedMotion } from "motion/react";

export function FloralCorner({
  position,
  size = 280,
  rotate = 0,
}: {
  position: "tl" | "tr" | "bl" | "br";
  size?: number;
  rotate?: number;
}) {
  const pos: Record<typeof position, string> = {
    tl: "top-0 left-0 -translate-x-1/4 -translate-y-1/4",
    tr: "top-0 right-0 translate-x-1/4 -translate-y-1/4",
    bl: "bottom-0 left-0 -translate-x-1/4 translate-y-1/4",
    br: "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
  };
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)` }}
      className={`pointer-events-none absolute ${pos[position]} opacity-50 mix-blend-multiply`}
    >
      <defs>
        <radialGradient id="leaf" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="oklch(80% 0.05 35)" stopOpacity="1" />
          <stop offset="100%" stopColor="oklch(70% 0.07 35)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="url(#leaf)">
        <path d="M30 170 Q60 100 100 100 Q140 100 170 30 Q120 60 100 100 Q80 140 30 170 Z" opacity="0.55" />
        <circle cx="40" cy="40" r="3" />
        <circle cx="55" cy="60" r="2" />
        <circle cx="160" cy="160" r="2.5" />
        <circle cx="140" cy="150" r="1.6" />
      </g>
    </svg>
  );
}

export function Rings({
  className = "",
  size = 380,
}: {
  className?: string;
  size?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 400 200"
      width={size}
      height={(size * 200) / 400}
      className={className}
      animate={reduce ? undefined : { rotate: [0, 1.6, 0] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
    >
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(72% 0.08 50)" />
          <stop offset="50%" stopColor="oklch(85% 0.06 70)" />
          <stop offset="100%" stopColor="oklch(60% 0.09 30)" />
        </linearGradient>
      </defs>
      <circle cx="140" cy="100" r="78" stroke="url(#ring-grad)" strokeWidth="3.5" fill="none" />
      <circle cx="240" cy="100" r="78" stroke="url(#ring-grad)" strokeWidth="3.5" fill="none" />
    </motion.svg>
  );
}

export function Sparkle({
  x,
  y,
  size = 14,
  delay = 0,
}: {
  x: string;
  y: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 20 20"
      width={size}
      height={size}
      className="absolute"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: [0, 1, 0], scale: [0.4, 1.1, 0.4] }}
      transition={{
        duration: 2.6,
        delay,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut",
      }}
    >
      <path
        d="M10 0 L11.5 8.5 L20 10 L11.5 11.5 L10 20 L8.5 11.5 L0 10 L8.5 8.5 Z"
        fill="oklch(80% 0.1 75)"
      />
    </motion.svg>
  );
}

export function GoldDot({
  className = "",
  size = 6,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full bg-(--color-primary) ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
