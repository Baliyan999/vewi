"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { FilmStrip } from "@/components/ui/film-strip";

export function How() {
  const t = useTranslations("how");
  const steps = [1, 2, 3] as const;

  return (
    <>
      <div className="container-page">
        <FilmStrip />
      </div>

      <section
        id="how"
        className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) py-(--space-section) bg-[color:var(--color-surface-container)]/30"
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
          <p className="text-body-md">
            Бесшовный опыт — гости остаются в моменте, пока вы получаете каждый ракурс.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-(--space-gutter)">
          {steps.map((i, idx) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={[
                "flex flex-col gap-6 p-8 border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)] rounded-sm",
                idx === 1 ? "md:mt-8" : "",
                idx === 2 ? "md:mt-16" : "",
              ].join(" ")}
            >
              <div className="text-display-lg text-[color:var(--color-accent-gold)] opacity-50">
                {`0${i}`}
              </div>
              <h3 className="text-headline-sm text-[color:var(--color-on-surface)]">
                {t(`step${i}Title` as "step1Title")}
              </h3>
              <p className="text-body-md">
                {t(`step${i}Desc` as "step1Desc")}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="container-page">
        <FilmStrip />
      </div>
    </>
  );
}
