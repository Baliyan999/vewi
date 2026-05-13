"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "./reveal";
import { DriftingOrbs, FloatingOrnaments, ParallaxY } from "./parallax";
import { cn } from "@/lib/utils";

const TIERS = [
  { key: "basic", featureCount: 5, drift: 0.04 },
  { key: "pro", featureCount: 6, highlighted: true, drift: -0.05 },
  { key: "premium", featureCount: 6, drift: 0.04 },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <DriftingOrbs variant="champagne" />
      <FloatingOrnaments count={14} hueBase={45} />

      <div className="container-page relative">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-(--color-primary)">
            ⋄ ⋄ ⋄
          </p>
          <h2 className="mb-4 text-4xl md:text-5xl">{t("title")}</h2>
          <p className="text-(--color-muted-foreground)">{t("subtitle")}</p>
        </Reveal>

        <Stagger className="grid items-start gap-6 md:grid-cols-3" step={0.12}>
          {TIERS.map((tier) => {
            const isHighlight = "highlighted" in tier && tier.highlighted;
            return (
              <StaggerItem key={tier.key}>
                <ParallaxY strength={tier.drift}>
                  <motion.div
                    whileHover={isHighlight ? { y: -6 } : { y: -3 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    className={cn(
                      "relative flex h-full flex-col rounded-(--radius-xl) p-8",
                      isHighlight
                        ? "border border-(--color-primary)/40 shadow-(--shadow-glow)"
                        : "border border-(--color-border) bg-white/70 shadow-(--shadow-soft) backdrop-blur",
                    )}
                    style={
                      isHighlight
                        ? {
                            background:
                              "linear-gradient(180deg, oklch(98% 0.02 70) 0%, oklch(94% 0.04 60) 100%)",
                          }
                        : undefined
                    }
                  >
                    {isHighlight && (
                      <>
                        <span
                          aria-hidden
                          className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-50 blur-md"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(75% 0.1 35), oklch(85% 0.06 70), oklch(75% 0.1 30))",
                          }}
                        />
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-(--color-primary) px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-(--color-primary-foreground) shadow-(--shadow-soft)">
                          {t("popular")}
                        </div>
                      </>
                    )}

                    <h3 className="font-display text-3xl">
                      {t(`${tier.key}.name` as "basic.name")}
                    </h3>
                    <div className="mt-5 flex items-baseline gap-2">
                      <span
                        className={cn(
                          "text-4xl font-display tracking-tight",
                          isHighlight ? "text-gradient-gold" : "",
                        )}
                      >
                        {t(`${tier.key}.price` as "basic.price")}
                      </span>
                      <span className="text-sm text-(--color-muted-foreground)">
                        {t("currency")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.18em] text-(--color-muted-foreground)">
                      {t("perEvent")}
                    </p>

                    <div className="my-6 h-px bg-(--color-border)" />

                    <ul className="flex flex-1 flex-col gap-3.5 text-sm">
                      {Array.from({ length: tier.featureCount }, (_, j) => j + 1).map(
                        (k) => (
                          <li key={k} className="flex items-start gap-3">
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-(--color-accent)/60 text-(--color-primary)">
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            <span>{t(`${tier.key}.f${k}` as "basic.f1")}</span>
                          </li>
                        ),
                      )}
                    </ul>

                    <a
                      href="#lead"
                      className={cn(
                        "mt-8",
                        buttonVariants({
                          variant: isHighlight ? "default" : "outline",
                          size: "lg",
                        }),
                        isHighlight && "shadow-(--shadow-soft)",
                      )}
                    >
                      {t("ctaSelect")}
                    </a>
                  </motion.div>
                </ParallaxY>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
