"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function Hero() {
  const t = useTranslations("hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-8%"]);

  return (
    <section
      ref={ref}
      className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) pt-32 md:pt-40 pb-24 md:pb-32"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-(--space-gutter) md:gap-16 items-center">
        {/* Text column */}
        <motion.div
          style={{ y: reduce ? 0 : textY }}
          className="flex flex-col gap-8 z-10"
        >
          <div className="label-caps text-[color:var(--color-accent-gold)]">
            {t("eyebrow")} · Wedding OS
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="text-display-md md:text-display-lg text-[color:var(--color-on-surface)] max-w-xl"
          >
            {t("title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="text-body-lg max-w-xl"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="flex flex-wrap gap-3 mt-2"
          >
            <a href="#lead" className={cn(buttonVariants({ size: "lg" }))}>
              {t("ctaPrimary")}
            </a>
            <a href="/e/demo" target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              {t("ctaSecondary")}
            </a>
          </motion.div>

          <motion.ul
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { delayChildren: 0.5, staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mt-4 max-w-xl"
          >
            {[1, 2, 3, 4].map((i) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
                }}
                className="flex items-start gap-2 text-body-md"
              >
                <Icon name="check" weight={400} className="text-[color:var(--color-accent-gold)] mt-0.5 text-[18px] shrink-0" />
                <span>{t(`bullet${i}` as "bullet1")}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Image / illustration column */}
        <motion.div
          style={{ y: reduce ? 0 : imgY }}
          className="relative w-full"
        >
          <div className="relative aspect-[4/5] md:aspect-[5/6] border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container)] overflow-hidden">
            <div
              className="absolute inset-2 grid place-items-center text-[color:var(--color-on-surface-variant)] overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, oklch(94% 0.04 60), oklch(82% 0.07 35))",
              }}
            >
              {/* Decorative monogram while no hero image */}
              <div className="text-center px-8">
                <div className="text-display-md italic text-[color:var(--color-on-surface)]">V&nbsp;E&nbsp;W&nbsp;I</div>
                <div className="label-caps mt-3 opacity-70">analog memories ·  digital archive</div>
              </div>
            </div>

            {/* Film perforations on left edge */}
            <div className="pointer-events-none absolute inset-y-3 left-1 flex flex-col justify-between">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="w-1.5 h-3 bg-[color:var(--color-background)]" />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-y-3 right-1 flex flex-col justify-between">
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className="w-1.5 h-3 bg-[color:var(--color-background)]" />
              ))}
            </div>
          </div>

          {/* Frame number */}
          <div className="absolute -bottom-3 left-4 label-caps bg-[color:var(--color-background)] px-2 text-[color:var(--color-accent-gold)]">
            Roll 01 · Frame 24
          </div>
        </motion.div>
      </div>
    </section>
  );
}
