"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * VEWI landing hero — 1:1 with the Stitch Premium screen.
 * Left column: eyebrow + display headline + body + two CTAs.
 * Right column: framed image (or monogram placeholder) inside a
 * surface-container hairline frame.
 */
export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) py-(--space-section) flex flex-col md:flex-row items-center gap-(--space-gutter) min-h-[707px]">
      {/* Text column */}
      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 flex flex-col justify-center gap-8 z-10"
      >
        <h1 className="text-display-md md:text-display-lg text-[color:var(--color-on-surface)] max-w-2xl">
          {t("title")}
        </h1>

        <p className="text-body-lg max-w-xl">
          {t("subtitle")}
        </p>

        <div className="flex gap-4 mt-4">
          <a href="#lead" className={cn(buttonVariants({ size: "lg" }))}>
            {t("ctaPrimary")}
          </a>
          <a
            href="/e/demo"
            target="_blank"
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </motion.div>

      {/* Image column */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="w-full md:w-1/2 h-[530px] md:h-[707px] relative mt-12 md:mt-0"
      >
        <div className="absolute inset-0 bg-[color:var(--color-surface-container)] rounded-sm border-[0.5px] border-[color:var(--color-outline-variant)] overflow-hidden p-2">
          {/* Decorative wedding-mood placeholder. Replace with hero image when available. */}
          <div
            className="w-full h-full rounded-sm grayscale hover:grayscale-0 transition-all duration-700 relative flex items-end justify-center pb-12"
            style={{
              background:
                "linear-gradient(160deg, oklch(86% 0.04 60) 0%, oklch(72% 0.07 35) 60%, oklch(50% 0.08 25) 100%)",
            }}
          >
            <div className="text-center text-[color:var(--color-surface)]">
              <div className="text-display-md italic">V&nbsp;·&nbsp;W</div>
              <div className="label-caps opacity-80 mt-2">VEWI · WEDDING OS</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
