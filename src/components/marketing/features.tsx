"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { FilmStrip } from "@/components/ui/film-strip";

const ICONS = ["live_tv", "videocam", "mic", "swipe", "shield_locked", "send"] as const;

export function Features() {
  const t = useTranslations("features");
  const items = [1, 2, 3, 4, 5, 6] as const;

  return (
    <>
      <div className="container-page">
        <FilmStrip />
      </div>

      <section
        id="features"
        className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) py-(--space-section)"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl mx-auto mb-16"
        >
          <h2 className="text-headline-md text-[color:var(--color-on-surface)] mb-4">
            {t("title")}
          </h2>
          <p className="text-body-md">{t("subtitle")}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-(--space-gutter)">
          {items.map((i, idx) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.06 }}
              className="border-[0.5px] border-[color:var(--color-outline-variant)] p-8 bg-[color:var(--color-surface)] flex flex-col gap-4"
            >
              <Icon
                name={ICONS[i - 1]}
                weight={300}
                size={28}
                className="text-[color:var(--color-accent-gold)]"
              />
              <h3 className="text-headline-sm text-[color:var(--color-on-surface)]">
                {t(`f${i}Title` as "f1Title")}
              </h3>
              <p className="text-body-md">{t(`f${i}Desc` as "f1Desc")}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}
