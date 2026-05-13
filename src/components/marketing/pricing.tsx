"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const TIERS = [
  { key: "basic", featureCount: 5 },
  { key: "pro", featureCount: 6, highlighted: true },
  { key: "premium", featureCount: 6 },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section
      id="pricing"
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-(--space-gutter) items-start max-w-5xl mx-auto">
        {TIERS.map((tier, idx) => {
          const isHi = "highlighted" in tier && tier.highlighted;
          return (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "relative border-[0.5px] p-8 rounded-sm flex flex-col gap-6",
                isHi
                  ? "border-[color:var(--color-on-surface)] bg-[color:var(--color-surface)] shadow-[0_0_0_1px_var(--color-on-surface)]"
                  : "border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)]",
                idx === 2 && !isHi ? "bg-[color:var(--color-surface-container)]" : "",
              )}
            >
              {isHi && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[color:var(--color-on-surface)] text-[color:var(--color-surface)] px-4 py-1 label-caps">
                  {t("popular")}
                </div>
              )}

              <h3 className={cn(
                "text-headline-sm text-[color:var(--color-on-surface)]",
                isHi && "mt-2",
              )}>
                {t(`${tier.key}.name` as "basic.name")}
              </h3>

              <div className="flex items-baseline gap-2">
                <span className="text-display-md text-[color:var(--color-on-surface)]">
                  {t(`${tier.key}.price` as "basic.price")}
                </span>
                <span className="text-body-md text-[color:var(--color-on-surface-variant)]">
                  {t("currency")}
                </span>
              </div>
              <p className="-mt-3 label-caps text-[color:var(--color-on-surface-variant)]">
                {t("perEvent")}
              </p>

              <ul className="flex flex-col gap-4 text-body-md flex-grow">
                {Array.from({ length: tier.featureCount }, (_, j) => j + 1).map((k) => (
                  <li key={k} className="flex items-start gap-3">
                    <Icon
                      name="check"
                      weight={400}
                      className="text-[color:var(--color-accent-gold)] text-[20px] mt-0.5 shrink-0"
                    />
                    <span>{t(`${tier.key}.f${k}` as "basic.f1")}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#lead"
                className={cn(
                  "w-full px-4 py-3 label-caps text-center border-[0.5px] transition-colors",
                  isHi
                    ? "bg-[color:var(--color-on-surface)] text-[color:var(--color-surface)] border-[color:var(--color-on-surface)] hover:opacity-80"
                    : "bg-transparent text-[color:var(--color-on-surface)] border-[color:var(--color-on-surface)] hover:bg-[color:var(--color-on-surface)] hover:text-[color:var(--color-surface)]",
                )}
              >
                {t("ctaSelect")}
              </a>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
