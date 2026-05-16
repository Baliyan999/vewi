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
      // Section padding uses viewport-height-aware clamp so that on
      // shorter 16:10 displays (≈900px tall, like MacBook 1440×900)
      // the chrome shrinks down and the three pricing cards fit
      // inside one screen with the title still visible above them.
      // On 16:9 displays (≥1080) the padding climbs back up to its
      // generous spacious feel.
      className="relative overflow-hidden"
      style={{
        paddingTop: "clamp(2.5rem, 7vh, 8rem)",
        paddingBottom: "clamp(2.5rem, 7vh, 8rem)",
      }}
    >
      <DriftingOrbs variant="champagne" />
      <FloatingOrnaments count={14} hueBase={45} />

      <div className="container-page relative">
        <Reveal
          className="mx-auto max-w-2xl text-center"
          // Title block margin shrinks with viewport height too.
        >
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-(--color-primary) sm:text-xs">
            ⋄ ⋄ ⋄
          </p>
          <h2 className="heading-display-lg mb-3">{t("title")}</h2>
          <p className="text-pretty text-base text-(--color-muted-foreground) sm:text-lg">
            {t("subtitle")}
          </p>
        </Reveal>

        <Stagger
          className="mt-8 grid items-start gap-5 sm:gap-6 md:mt-12 lg:grid-cols-3"
          step={0.12}
        >
          {TIERS.map((tier) => {
            const isHighlight = "highlighted" in tier && tier.highlighted;
            return (
              <StaggerItem key={tier.key}>
                <ParallaxY strength={tier.drift}>
                  <motion.div
                    whileHover={isHighlight ? { y: -6 } : { y: -3 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    className={cn(
                      "relative flex h-full flex-col rounded-(--radius-xl) p-5 sm:p-6 md:p-7",
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

                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl">
                      {t(`${tier.key}.name` as "basic.name")}
                    </h3>
                    <div className="mt-3 flex items-baseline gap-2 md:mt-4">
                      <span
                        className={cn(
                          "font-display text-2xl tracking-tight sm:text-3xl md:text-4xl",
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

                    <div className="my-4 h-px bg-(--color-border) md:my-6" />

                    <ul className="flex flex-1 flex-col gap-2.5 text-sm md:gap-3.5">
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
                        "mt-5 md:mt-7",
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
