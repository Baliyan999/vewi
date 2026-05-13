"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";

const ICONS = ["qr_code_2", "tag", "auto_stories", "archive"] as const;

export function Features() {
  const t = useTranslations("features");
  const items = [1, 2, 3, 4] as const;

  return (
    <section
      id="features"
      className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) pb-16"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 max-w-5xl mx-auto">
        {items.map((i, idx) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: idx * 0.06 }}
            className="border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] p-6 flex flex-col gap-3"
          >
            <Icon
              name={ICONS[i - 1]}
              weight={300}
              size={22}
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
  );
}
