"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import { Rings, Sparkle } from "./ornaments";
import {
  PointerParallaxScene,
  PointerLayer,
  MouseTilt,
} from "./parallax";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const wordEnter: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      delay: 0.15 + i * 0.08,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const titleScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const ringsY = useTransform(scrollYProgress, [0, 1], ["0%", "75%"]);
  const ringsRotate = useTransform(scrollYProgress, [0, 1], [0, 12]);

  const titleWords = t("title").split(" ");

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden pt-[calc(env(safe-area-inset-top,0)+5.5rem)] md:pt-24"
    >
      <PointerParallaxScene range={40} className="absolute inset-0 -z-10">
        <PointerLayer depth={0.2}>
          <Sparkle x="10%" y="22%" size={18} delay={0.2} />
          <Sparkle x="84%" y="18%" size={12} delay={0.6} />
        </PointerLayer>
        <PointerLayer depth={0.45}>
          <Sparkle x="22%" y="68%" size={14} delay={1.1} />
          <Sparkle x="78%" y="62%" size={16} delay={1.7} />
        </PointerLayer>
        <PointerLayer depth={0.75}>
          <Sparkle x="50%" y="8%" size={10} delay={0.9} />
          <Sparkle x="34%" y="40%" size={8} delay={2.1} />
          <Sparkle x="66%" y="44%" size={9} delay={1.5} />
        </PointerLayer>
      </PointerParallaxScene>

      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6 }}
        style={{
          y: reduce ? 0 : ringsY,
          rotate: reduce ? 0 : ringsRotate,
        }}
        className="pointer-events-none absolute left-1/2 top-[44%] -z-10 -translate-x-1/2 animate-float"
      >
        <Rings size={520} />
      </motion.div>

      <motion.div
        style={{
          y: reduce ? 0 : titleY,
          scale: reduce ? 1 : titleScale,
          opacity: reduce ? 1 : titleOpacity,
        }}
        className="container-page relative pb-16 pt-10 md:pb-24 md:pt-20"
      >
        <MouseTilt intensity={4} className="mx-auto max-w-4xl text-center">
          <h1 className="heading-display-xl text-balance">
            {titleWords.map((w, i) => (
              <motion.span
                key={i}
                custom={i}
                variants={wordEnter}
                initial="hidden"
                animate="visible"
                className="mr-[0.25em] inline-block"
              >
                {i === Math.floor(titleWords.length / 2) ? (
                  // Solid --color-primary, NOT .text-gradient-gold. The
                  // gradient relies on background-clip:text which clips
                  // to the inline line-box — Hero's tight leading-[1.02]
                  // is too short for italic Cyrillic glyphs whose tops
                  // ("о", "с") sit a hair above the cap height, so they
                  // render with clipped tops. Solid color paints the
                  // entire glyph natively, no clip-box involved. Same
                  // fix used in StickyHeadline.
                  <span className="italic font-medium text-(--color-primary)">{w}</span>
                ) : (
                  w
                )}
              </motion.span>
            ))}
          </h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mx-auto mt-7 flex max-w-2xl items-center justify-center"
          >
            <span className="h-px flex-1 bg-(--color-border)" />
            <span className="px-4 text-xs uppercase tracking-[0.3em] text-(--color-muted-foreground)">
              для вашей свадьбы
            </span>
            <span className="h-px flex-1 bg-(--color-border)" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-(--color-muted-foreground) sm:text-lg md:text-xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
          >
            <a
              href="#lead"
              className={cn(
                buttonVariants({ size: "lg" }),
                "group relative w-full overflow-hidden px-7 shadow-(--shadow-soft) sm:w-auto",
              )}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {t("ctaPrimary")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <span className="absolute inset-0 -z-0 bg-gradient-to-r from-(--color-primary) via-(--color-rose) to-(--color-primary) bg-[length:200%_100%] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:[animation:shimmer_2.4s_linear_infinite]" />
            </a>
            <a
              href="#how"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "w-full justify-center border-(--color-border) bg-white/70 backdrop-blur sm:w-auto",
              )}
            >
              {t("ctaSecondary")}
            </a>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { delayChildren: 1.5, staggerChildren: 0.12 } },
            }}
            className="mx-auto mt-12 grid max-w-3xl gap-x-6 gap-y-3 text-left text-sm text-(--color-muted-foreground) sm:grid-cols-2 md:mt-16"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -16 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="flex items-center gap-3"
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
                  ✓
                </span>
                <span>{t(`bullet${i}` as "bullet1")}</span>
              </motion.li>
            ))}
          </motion.ul>
        </MouseTilt>
      </motion.div>

    </section>
  );
}
