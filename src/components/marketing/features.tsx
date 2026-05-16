"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  useMotionValue,
  useSpring,
  type MotionValue,
  type Variants,
} from "motion/react";
import { Tv, Video, Mic, Hand, ShieldCheck, Send } from "lucide-react";
import { DriftingOrbs, FloatingOrnaments } from "./parallax";

/**
 * Features ("Что внутри") — 6 cards highlighting product capabilities.
 * Modernized to share the motion language of the rest of the page:
 *
 *   • Word-by-word title reveal + ⋄ ⋄ ⋄ eyebrow letter-spacing tween.
 *   • Section-wide cursor spotlight (soft champagne halo following the
 *     mouse, spring-smoothed).
 *   • Each FeatureCard:
 *       - 3D tilt driven by motion values + springs (no setState, no
 *         re-renders per pointer-move).
 *       - Hover detection via outer wrapper + variants on inner content
 *         so the hover state can't unhover itself when the card lifts.
 *       - Per-card hue accent — index-based rotation through the warm
 *         palette so the grid reads as a sequence of related-but-not-
 *         identical chips.
 *       - Numbered chip in top-right corner.
 *       - Animated icon container that grows + glows on hover.
 *       - Cursor-following highlight inside the card body.
 *       - Scroll-driven staggered entrance (rotateY + translateZ + opacity).
 */

const ICONS = [Tv, Video, Mic, Hand, ShieldCheck, Send] as const;
// Per-card warm-spectrum hue. Reads sequentially: rose → champagne →
// gold → champagne → rose-tan → mid. Creates visual rhythm without
// breaking the brand palette.
const HUES = [25, 40, 55, 70, 30, 50] as const;

export function Features() {
  const t = useTranslations("features");
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });

  // Cursor spotlight tracking (section-wide).
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const spotX = useSpring(cursorX, { stiffness: 120, damping: 24, mass: 0.6 });
  const spotY = useSpring(cursorY, { stiffness: 120, damping: 24, mass: 0.6 });

  function onMove(e: React.MouseEvent<HTMLElement>) {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - r.left);
    cursorY.set(e.clientY - r.top);
  }

  // Gentle title parallax through the section lifecycle.
  const titleY = useTransform(scrollYProgress, [0, 1], ["20%", "-15%"]);

  const items = [1, 2, 3, 4, 5, 6] as const;

  return (
    <section
      id="features"
      ref={sectionRef}
      onMouseMove={reduce ? undefined : onMove}
      // overflow-x-clip lets the DriftingOrbs blend with whatever decoration
      // is bleeding out of GalleryPreview above — removes the horizontal
      // seam at the section boundary.
      className="relative overflow-x-clip py-20 md:py-32"
    >
      {/* Cursor spotlight — soft champagne halo following the cursor. */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            left: spotX,
            top: spotY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="pointer-events-none absolute -z-10 h-[640px] w-[640px] rounded-full bg-(--color-rose)/12 opacity-70 blur-3xl"
        />
      )}

      <DriftingOrbs variant="mix" />
      <FloatingOrnaments count={18} hueBase={20} hueSpread={70} />

      <div className="container-page relative">
        <motion.div
          style={{ y: reduce ? 0 : titleY }}
          className="mx-auto mb-12 max-w-2xl text-center md:mb-16"
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((i, idx) => {
            const Icon = ICONS[i - 1];
            return (
              <FeatureCard
                key={i}
                index={idx}
                number={i}
                hue={HUES[idx]}
                icon={<Icon className="h-6 w-6" strokeWidth={1.5} />}
                title={t(`f${i}Title` as "f1Title")}
                desc={t(`f${i}Desc` as "f1Desc")}
                progress={scrollYProgress}
                reduce={reduce ?? false}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TitleReveal({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const wordVariants: Variants = {
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

function FeatureCard({
  index,
  number,
  hue,
  icon,
  title,
  desc,
  progress,
  reduce,
}: {
  index: number;
  number: number;
  hue: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  // 3D tilt driven by motion values (no React state, no per-frame rerenders).
  const cardRef = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotX = useSpring(useTransform(py, [0, 1], [8, -8]), {
    stiffness: 180,
    damping: 22,
  });
  const rotY = useSpring(useTransform(px, [0, 1], [-10, 10]), {
    stiffness: 180,
    damping: 22,
  });
  // Highlight follows the cursor inside the card body — recomputed
  // on each pointer move via a derived CSS variable on the card.
  const highlightX = useTransform(px, (v) => `${v * 100}%`);
  const highlightY = useTransform(py, (v) => `${v * 100}%`);

  function onCardMove(e: React.MouseEvent<HTMLDivElement>) {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function resetTilt() {
    px.set(0.5);
    py.set(0.5);
  }

  // Per-card staggered scroll entrance. 6 cards split the first 60% of
  // the section's scroll budget — every card finishes its reveal before
  // the section title hits mid-viewport.
  const total = 6;
  const enterStart = (index / total) * 0.3;
  const enterEnd = enterStart + 0.18;
  const enterOpacity = useTransform(
    progress,
    [enterStart, enterEnd],
    [0, 1],
  );
  const enterY = useTransform(progress, [enterStart, enterEnd], [40, 0]);
  const enterRotateX = useTransform(
    progress,
    [enterStart, enterEnd],
    [20, 0],
  );
  const enterScale = useTransform(progress, [enterStart, enterEnd], [0.88, 1]);

  return (
    <motion.div
      // Outer = stable hover surface (doesn't move on hover). Inner = the
      // visible card that tilts, lifts, glows. This prevents the hover-
      // unhover jitter loop that bites when the lifting element is the
      // same one whose hover state is being detected.
      style={
        reduce
          ? undefined
          : {
              opacity: enterOpacity,
              y: enterY,
              rotateX: enterRotateX,
              scale: enterScale,
              transformPerspective: 1200,
              transformStyle: "preserve-3d",
            }
      }
      whileHover="hover"
      initial="rest"
      animate="rest"
      onMouseMove={onCardMove}
      onMouseLeave={resetTilt}
      className="relative h-full"
    >
      <motion.div
        ref={cardRef}
        variants={{
          rest: { y: 0, boxShadow: "var(--shadow-soft)" },
          hover: {
            y: -6,
            boxShadow:
              "0 24px 50px -12px rgb(180 130 100 / 0.35), 0 0 0 1px oklch(92% 0.04 60)",
          },
        }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        style={{
          rotateX: reduce ? 0 : rotX,
          rotateY: reduce ? 0 : rotY,
          transformStyle: "preserve-3d",
        }}
        className="surface-card group relative h-full overflow-hidden rounded-(--radius-lg) p-5 sm:p-7"
      >
        {/* Per-card hue accent glow — sits behind content, intensifies on
            hover. Different hue per card adds variety to the grid. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-30 blur-2xl transition-opacity duration-500 group-hover:opacity-90"
          style={{ background: `oklch(86% 0.08 ${hue})` }}
        />

        {/* Cursor-following highlight inside card body */}
        {!reduce && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(circle 220px at ${highlightX} ${highlightY}, oklch(98% 0.06 ${hue} / 0.6), transparent 65%)`,
            }}
          />
        )}

        {/* Animated gradient border on hover */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-(--radius-lg) opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            padding: "1px",
            background: `linear-gradient(135deg,
              oklch(70% 0.12 ${hue}) 0%,
              oklch(85% 0.06 ${hue + 30}) 50%,
              oklch(70% 0.12 ${hue - 10}) 100%)`,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />

        {/* Numbered chip — top-right corner */}
        <motion.span
          variants={{
            rest: { scale: 1, opacity: 0.4 },
            hover: { scale: 1.05, opacity: 1 },
          }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          className="absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full bg-(--color-background) text-[10px] font-medium text-(--color-primary) shadow-(--shadow-soft) sm:right-5 sm:top-5 sm:h-7 sm:w-7 sm:text-xs"
          style={{
            border: `1px solid oklch(88% 0.05 ${hue})`,
          }}
        >
          {String(number).padStart(2, "0")}
        </motion.span>

        {/* Icon container — gradient bg + per-card hue accent + hover-pulse */}
        <motion.div
          variants={{
            rest: { scale: 1, rotate: 0 },
            hover: { scale: 1.08, rotate: -4 },
          }}
          transition={{ type: "spring", stiffness: 240, damping: 18 }}
          className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl text-(--color-primary)"
          style={{
            background: `linear-gradient(135deg, oklch(95% 0.05 ${hue}), oklch(88% 0.08 ${hue - 5}))`,
            transform: "translateZ(30px)",
            boxShadow: `0 6px 16px -8px oklch(70% 0.1 ${hue} / 0.5)`,
          }}
        >
          {icon}
          {/* Pulse ring — animates outward continuously, hidden in idle,
              visible on hover */}
          <motion.span
            aria-hidden
            variants={{
              rest: { opacity: 0, scale: 0.8 },
              hover: { opacity: [0, 0.7, 0], scale: [0.8, 1.6, 1.6] },
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeOut",
            }}
            className="pointer-events-none absolute inset-0 rounded-xl border-2"
            style={{ borderColor: `oklch(70% 0.1 ${hue})` }}
          />
        </motion.div>

        <motion.h3
          variants={{
            rest: { x: 0 },
            hover: { x: 3 },
          }}
          transition={{ type: "spring", stiffness: 240, damping: 20 }}
          className="relative mb-2 text-xl md:text-2xl"
          style={{ transform: "translateZ(20px)" }}
        >
          {title}
        </motion.h3>
        <p
          className="relative text-sm leading-relaxed text-(--color-muted-foreground) transition-colors duration-500 group-hover:text-(--color-foreground)"
          style={{ transform: "translateZ(10px)" }}
        >
          {desc}
        </p>
      </motion.div>
    </motion.div>
  );
}
