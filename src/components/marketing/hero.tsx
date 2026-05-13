"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { buttonVariants } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * VEWI Hero — wireframe-faithful version.
 *
 *  • Centered text column with two-line headline (italic gold accent)
 *  • Body paragraph + two CTAs
 *  • Below: small phone-frame demo card showing the QR-scan moment with a
 *    couple monogram and event date.
 */
export function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) pt-24 pb-20 md:pt-32 md:pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center text-center max-w-2xl mx-auto"
      >
        <p className="label-caps text-[color:var(--color-on-surface-variant)] mb-3">
          {t("eyebrow")}
        </p>

        <h1 className="text-display-md md:text-display-lg leading-[1.1] text-[color:var(--color-on-surface)]">
          {t("titlePre")}
          <br />
          {t("titleLine2pre")}{" "}
          <span className="italic text-[color:var(--color-accent-gold)]">
            {t("titleAccent")}
          </span>{" "}
          {t("titleLine2post")}
        </h1>

        <p className="text-body-lg mt-6 max-w-lg">{t("subtitle")}</p>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <a href="#lead" className={cn(buttonVariants({ size: "lg", variant: "gold" }))}>
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

      {/* Phone-frame demo card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto mt-14 w-full max-w-[280px]"
      >
        <div className="relative border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] p-6 flex flex-col items-center text-center gap-4">
          {/* QR placeholder block */}
          <div className="w-20 h-20 border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container)] grid place-items-center">
            <Icon
              name="qr_code_2"
              weight={300}
              size={48}
              className="text-[color:var(--color-on-surface-variant)] opacity-60"
            />
          </div>
          <p className="font-display italic text-[color:var(--color-on-surface)] text-[18px]">
            {t("demoCaption")}
          </p>
          <p className="label-caps text-[10px] text-[color:var(--color-on-surface-variant)]">
            {t("demoSubcaption")}
          </p>
        </div>
      </motion.div>
    </section>
  );
}
