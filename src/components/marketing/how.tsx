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
} from "motion/react";
import { QrCode, Camera, Heart } from "lucide-react";
import { Reveal } from "./reveal";
import { MouseTilt, FloatingOrnaments } from "./parallax";
import { Rings } from "./ornaments";

const ICONS = [QrCode, Camera, Heart] as const;
// Each step "ignites" (gets a pulse ring + scale-up) when scrollYProgress
// reaches this value. Distributed so steps light up one after another in
// rhythm with the user passing them on-screen.
const STEP_ACTIVATIONS = [0.18, 0.5, 0.82] as const;

export function How() {
  const t = useTranslations("how");
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });

  // Cursor coordinates relative to the section. A soft spotlight follows
  // the cursor and gently lights up whatever the user is hovering over.
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const spotX = useSpring(cursorX, { stiffness: 120, damping: 24, mass: 0.6 });
  const spotY = useSpring(cursorY, { stiffness: 120, damping: 24, mass: 0.6 });

  function onSectionMouseMove(e: React.MouseEvent<HTMLElement>) {
    if (!sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    cursorX.set(e.clientX - r.left);
    cursorY.set(e.clientY - r.top);
  }

  // Master scroll-driven motion values for the timeline.
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const cometTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const cometOpacity = useTransform(
    scrollYProgress,
    [0, 0.05, 0.95, 1],
    [0, 1, 1, 0],
  );

  // Background parallax — rings drift further than the title, title floats
  // gently against them for depth.
  const ringsY = useTransform(scrollYProgress, [0, 1], ["-20%", "40%"]);
  const ringsRotate = useTransform(scrollYProgress, [0, 1], [-12, 10]);
  const haloY = useTransform(scrollYProgress, [0, 1], ["30%", "-20%"]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["25%", "-12%"]);

  const steps = [1, 2, 3] as const;

  return (
    <section
      id="how"
      ref={sectionRef}
      onMouseMove={reduce ? undefined : onSectionMouseMove}
      className="relative overflow-hidden py-20 md:py-32"
    >
      {/* Cursor spotlight — wide soft rose halo following the cursor.
          Anchored at top/left, then centered on the cursor with -50%
          translate. Spring-smoothed so motion feels gentle, not jittery. */}
      {!reduce && (
        <motion.div
          aria-hidden
          style={{
            left: spotX,
            top: spotY,
            translateX: "-50%",
            translateY: "-50%",
          }}
          className="pointer-events-none absolute -z-10 h-[520px] w-[520px] rounded-full bg-(--color-rose)/15 opacity-60 blur-3xl"
        />
      )}

      {/* Background depth layers — concentric rings on the right and a soft
          champagne halo on the left, each drifting at different speeds. */}
      <motion.div
        aria-hidden
        style={{
          y: reduce ? 0 : ringsY,
          rotate: reduce ? 0 : ringsRotate,
        }}
        className="pointer-events-none absolute -right-32 top-20 -z-10 opacity-30"
      >
        <Rings size={720} />
      </motion.div>
      <motion.div
        aria-hidden
        style={{ y: reduce ? 0 : haloY }}
        className="pointer-events-none absolute -left-40 top-1/3 -z-10 h-[520px] w-[520px] rounded-full bg-(--color-champagne)/30 blur-3xl"
      />
      <motion.div
        aria-hidden
        style={{ y: reduce ? 0 : ringsY }}
        className="pointer-events-none absolute right-1/4 -bottom-20 -z-10 h-[420px] w-[420px] rounded-full bg-(--color-rose)/25 blur-3xl"
      />

      <FloatingOrnaments count={14} hueBase={25} hueSpread={70} />

      <div className="container-page relative">
        <motion.div style={{ y: reduce ? 0 : titleY }}>
          <Reveal className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
            <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-(--color-primary) sm:text-xs">
              ⋄ ⋄ ⋄
            </p>
            <h2 className="heading-display-lg text-balance">{t("title")}</h2>
          </Reveal>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          {/* Vertical timeline. Three layers stacked:
              1. Static thin track (subtle border colour) — the "rail".
              2. Animated colored line drawn top-to-bottom on scroll — the
                 "ink" being laid down.
              3. Glowing comet at the leading edge, four-layer glow stack. */}
          <div className="absolute left-[31px] top-2 hidden h-full w-[2px] bg-(--color-border)/60 sm:left-[39px] md:block">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full origin-top bg-gradient-to-b from-(--color-primary) via-(--color-rose) to-(--color-champagne)"
            />
            {!reduce && (
              <motion.div
                aria-hidden
                style={{ top: cometTop, opacity: cometOpacity }}
                className="absolute left-1/2 z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="absolute inset-0 -m-6 rounded-full bg-(--color-rose) opacity-60 blur-xl" />
                <span className="absolute inset-0 -m-3 rounded-full bg-(--color-primary)/60 blur-md" />
                <span className="absolute inset-0 rounded-full bg-(--color-primary) shadow-[0_0_12px_var(--color-primary)]" />
                <span className="absolute inset-1 rounded-full bg-white/70" />
              </motion.div>
            )}
          </div>

          <ol className="flex flex-col gap-10 md:gap-14">
            {steps.map((i, idx) => (
              <li key={i}>
                <Step
                  index={idx}
                  number={i}
                  Icon={ICONS[idx]}
                  title={t(`step${i}Title` as "step1Title")}
                  desc={t(`step${i}Desc` as "step1Desc")}
                  activation={STEP_ACTIVATIONS[idx]}
                  progress={scrollYProgress}
                  reduce={reduce ?? false}
                />
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/**
 * Step — a single timeline row that:
 *   • Slides in from alternating sides (odd index = right, even = left) as
 *     it enters the viewport, with a scale-up + rotate + de-blur transition
 *     driven by its OWN scrollYProgress (not the section's).
 *   • Wraps content in MouseTilt for a subtle 3D tilt on hover.
 *   • Hosts a StepBadge that lights up via section-wide scroll progress.
 */
function Step({
  index,
  number,
  Icon,
  title,
  desc,
  activation,
  progress,
  reduce,
}: {
  index: number;
  number: number;
  Icon: (typeof ICONS)[number];
  title: string;
  desc: string;
  activation: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: stepProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 35%"],
  });

  const isOdd = index % 2 === 1;
  const fromX = isOdd ? 140 : -140;
  const fromRotate = isOdd ? 4 : -4;

  const x = useTransform(stepProgress, [0, 1], [fromX, 0]);
  const opacity = useTransform(stepProgress, [0, 0.5, 1], [0, 0.6, 1]);
  const scale = useTransform(stepProgress, [0, 1], [0.82, 1]);
  const rotate = useTransform(stepProgress, [0, 1], [fromRotate, 0]);
  const filter = useTransform(
    stepProgress,
    [0, 0.5, 1],
    ["blur(10px)", "blur(3px)", "blur(0px)"],
  );

  return (
    <motion.div
      ref={ref}
      style={
        reduce
          ? undefined
          : {
              x,
              opacity,
              scale,
              rotate,
              filter,
            }
      }
    >
      <MouseTilt intensity={4} perspective={1200}>
        <div className="grid grid-cols-[64px_1fr] items-start gap-4 sm:grid-cols-[80px_1fr] sm:gap-6">
          <StepBadge
            Icon={Icon}
            number={number}
            activation={activation}
            progress={progress}
            reduce={reduce}
          />

          <div
            className="pt-1 sm:pt-2"
            style={{ transform: "translateZ(30px)" }}
          >
            <h3 className="mb-2 heading-display-md">{title}</h3>
            <p className="max-w-xl text-pretty text-(--color-muted-foreground)">
              {desc}
            </p>
          </div>
        </div>
      </MouseTilt>
    </motion.div>
  );
}

/**
 * StepBadge — circle with icon + number bubble. Lights up with a pulse ring,
 * a soft scale-up and a glow halo when the scroll progress passes its
 * activation threshold. Stays lit once reached.
 */
function StepBadge({
  Icon,
  number,
  activation,
  progress,
  reduce,
}: {
  Icon: (typeof ICONS)[number];
  number: number;
  activation: number;
  progress: MotionValue<number>;
  reduce: boolean;
}) {
  const lit = useTransform(
    progress,
    [activation - 0.12, activation + 0.06],
    [0, 1],
  );
  const scale = useTransform(lit, [0, 1], [1, 1.08]);
  const haloOpacity = useTransform(lit, [0, 1], [0, 0.8]);
  const ringOpacity = useTransform(lit, [0, 0.5, 1], [0, 0.7, 0]);
  const ringScale = useTransform(lit, [0, 1], [0.6, 1.6]);

  return (
    <motion.div
      whileHover={{ rotate: -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      style={{
        scale: reduce ? 1 : scale,
        transform: "translateZ(50px)",
      }}
      className="relative grid h-16 w-16 place-items-center rounded-full bg-white shadow-(--shadow-soft) sm:h-20 sm:w-20"
    >
      {!reduce && (
        <motion.span
          aria-hidden
          style={{ opacity: haloOpacity }}
          className="pointer-events-none absolute inset-0 -m-4 rounded-full bg-(--color-primary)/30 blur-xl"
        />
      )}

      {!reduce && (
        <motion.span
          aria-hidden
          style={{ opacity: ringOpacity, scale: ringScale }}
          className="pointer-events-none absolute inset-0 rounded-full border-2 border-(--color-primary)"
        />
      )}

      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ border: "1px solid oklch(92% 0.015 70)" }}
      />
      <Icon
        className="relative h-6 w-6 text-(--color-primary) sm:h-7 sm:w-7"
        strokeWidth={1.5}
      />
      <span className="absolute -right-1 -top-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-(--color-primary) text-[11px] font-semibold text-(--color-primary-foreground) shadow-(--shadow-soft) sm:h-7 sm:w-7 sm:text-xs">
        {number}
      </span>
    </motion.div>
  );
}
