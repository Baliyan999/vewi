"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "./reveal";
import { FloatingOrnaments, ParallaxY } from "./parallax";
import { cn } from "@/lib/utils";

const TIERS = [
  { key: "basic", featureCount: 5, drift: 0.04 },
  { key: "pro", featureCount: 6, highlighted: true, drift: -0.05 },
  { key: "premium", featureCount: 6, drift: 0.04 },
  { key: "luxury", featureCount: 7, drift: -0.04, luxe: true },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section
      id="pricing"
      // Section padding uses viewport-height-aware clamp so that when
      // the user clicks the "Тарифы" nav link on a 16:10 display
      // (~900px tall), the entire section (title + 4 cards + CTAs)
      // fits inside one screen below the sticky header. On 16:9
      // displays (≥1080) the padding climbs back up to feel spacious.
      // The 5vh lower bound trims ~32px more than the previous 7vh
      // so cards don't get clipped at the bottom on shorter viewports.
      className="relative overflow-hidden scroll-mt-20"
      style={{
        paddingTop: "clamp(1.5rem, 5vh, 6rem)",
        paddingBottom: "clamp(1.5rem, 5vh, 6rem)",
      }}
    >
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
          className="mt-6 grid items-start gap-4 sm:grid-cols-2 sm:gap-5 md:mt-10 md:gap-6 lg:grid-cols-4"
          step={0.1}
        >
          {TIERS.map((tier) => {
            const isHighlight = "highlighted" in tier && tier.highlighted;
            const isLuxe = "luxe" in tier && tier.luxe;
            return (
              <StaggerItem key={tier.key}>
                <ParallaxY strength={tier.drift}>
                  <motion.div
                    whileHover={isHighlight || isLuxe ? { y: -6 } : { y: -3 }}
                    transition={{ type: "spring", stiffness: 280, damping: 20 }}
                    className={cn(
                      "relative flex h-full flex-col rounded-(--radius-xl) p-5 sm:p-6 md:p-7",
                      isHighlight &&
                        "border border-(--color-primary)/40 shadow-(--shadow-glow)",
                      isLuxe &&
                        "border border-(--color-foreground)/30 shadow-[0_24px_60px_-20px_rgb(60_30_15_/_0.35)]",
                      !isHighlight &&
                        !isLuxe &&
                        "border border-(--color-border) bg-white/70 shadow-(--shadow-soft) backdrop-blur",
                    )}
                    style={
                      isHighlight
                        ? {
                            background:
                              "linear-gradient(180deg, oklch(98% 0.02 70) 0%, oklch(94% 0.04 60) 100%)",
                          }
                        : isLuxe
                          ? {
                              background:
                                "linear-gradient(180deg, oklch(24% 0.04 50) 0%, oklch(18% 0.05 40) 100%)",
                              color: "oklch(95% 0.02 70)",
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
                    {isLuxe && (
                      <>
                        <span
                          aria-hidden
                          className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-60 blur-lg"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(55% 0.1 35), oklch(70% 0.08 60), oklch(50% 0.09 30))",
                          }}
                        />
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] shadow-(--shadow-soft)"
                          style={{
                            background:
                              "linear-gradient(135deg, oklch(70% 0.12 50), oklch(85% 0.08 75))",
                            color: "oklch(20% 0.04 35)",
                          }}>
                          ★ Эксклюзив
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
                          isHighlight && "text-gradient-gold",
                        )}
                        style={
                          isLuxe
                            ? {
                                background:
                                  "linear-gradient(120deg, oklch(82% 0.1 70), oklch(90% 0.08 50), oklch(78% 0.12 30))",
                                WebkitBackgroundClip: "text",
                                backgroundClip: "text",
                                color: "transparent",
                              }
                            : undefined
                        }
                      >
                        {t(`${tier.key}.price` as "basic.price")}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          isLuxe
                            ? "text-white/60"
                            : "text-(--color-muted-foreground)",
                        )}
                      >
                        {t("currency")}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-xs uppercase tracking-[0.18em]",
                        isLuxe
                          ? "text-white/50"
                          : "text-(--color-muted-foreground)",
                      )}
                    >
                      {t("perEvent")}
                    </p>

                    <div
                      className={cn(
                        "my-3 h-px md:my-5",
                        isLuxe ? "bg-white/15" : "bg-(--color-border)",
                      )}
                    />

                    <ul className="flex flex-1 flex-col gap-2.5 text-sm md:gap-3.5">
                      {Array.from({ length: tier.featureCount }, (_, j) => j + 1).map(
                        (k) => (
                          <li key={k} className="flex items-start gap-3">
                            <span
                              className={cn(
                                "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full",
                                isLuxe
                                  ? "bg-white/10 text-(--color-champagne)"
                                  : "bg-(--color-accent)/60 text-(--color-primary)",
                              )}
                            >
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
                        !isLuxe &&
                          buttonVariants({
                            variant: isHighlight ? "default" : "outline",
                            size: "lg",
                          }),
                        isHighlight && "shadow-(--shadow-soft)",
                        isLuxe &&
                          "inline-flex h-11 items-center justify-center rounded-md px-8 text-sm font-medium shadow-(--shadow-soft) transition-all hover:opacity-90",
                      )}
                      style={
                        isLuxe
                          ? {
                              background:
                                "linear-gradient(135deg, oklch(80% 0.1 60), oklch(88% 0.08 75))",
                              color: "oklch(20% 0.04 35)",
                            }
                          : undefined
                      }
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
