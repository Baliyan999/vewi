"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

const TIERS = [
  { key: "basic", featureCount: 2 },
  { key: "classic", featureCount: 2, highlighted: true },
  { key: "premium", featureCount: 2 },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section
      id="pricing"
      className="px-(--space-margin-mobile) md:px-(--space-margin-desktop) pb-20"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 max-w-3xl mx-auto">
        {TIERS.map((tier, idx) => {
          const isHi = "highlighted" in tier && tier.highlighted;
          return (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.08 }}
              className={cn(
                "relative border-[0.5px] p-6 flex flex-col items-center text-center gap-3",
                isHi
                  ? "bg-[color:var(--color-surface-container)] border-[color:var(--color-accent-gold)]"
                  : "bg-[color:var(--color-surface-container-low)] border-[color:var(--color-outline-variant)]",
              )}
            >
              {isHi && (
                <div className="absolute -top-2.5 right-3 bg-[color:var(--color-accent-gold)] text-[color:var(--color-background)] px-2 py-0.5 label-caps text-[9px]">
                  {t("popular")}
                </div>
              )}

              <span className="label-caps text-[color:var(--color-on-surface-variant)]">
                {t(`${tier.key}.name` as "basic.name")}
              </span>

              <div className="flex items-baseline gap-0.5">
                <span className="text-body-md text-[color:var(--color-on-surface-variant)]">
                  {t("currency")}
                </span>
                <span className="text-display-md text-[color:var(--color-on-surface)] leading-none">
                  {t(`${tier.key}.price` as "basic.price")}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 text-body-md text-[color:var(--color-on-surface-variant)]">
                {Array.from({ length: tier.featureCount }, (_, j) => j + 1).map(
                  (k) => (
                    <span key={k}>{t(`${tier.key}.f${k}` as "basic.f1")}</span>
                  ),
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
