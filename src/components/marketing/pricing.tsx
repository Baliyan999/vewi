"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Info, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Reveal, Stagger, StaggerItem } from "./reveal";
import { FloatingOrnaments, ParallaxY } from "./parallax";
import { cn } from "@/lib/utils";

type Tier = {
  key: "basic" | "pro" | "premium" | "luxury";
  featureCount: number;
  drift: number;
  minH: number;
  highlighted?: boolean;
  luxe?: boolean;
};

// All cards same height + same parallax drift = 0 → tops and bottoms
// line up exactly across the row. Drift was previously per-tier (some
// negative, lifting Pro/Luxury upward as the user scrolled past) which
// caused the cards to appear at different Y positions even though
// their box heights were identical.
const TIERS: readonly Tier[] = [
  { key: "basic",   featureCount: 5, drift: 0, minH: 43 },
  { key: "pro",     featureCount: 7, highlighted: true, drift: 0, minH: 43 },
  { key: "premium", featureCount: 6, drift: 0, minH: 43 },
  { key: "luxury",  featureCount: 7, drift: 0, luxe: true, minH: 43 },
] as const;

export function Pricing() {
  const t = useTranslations("pricing");

  return (
    <section
      id="pricing"
      className="relative overflow-hidden scroll-mt-20"
      style={{
        paddingTop: "clamp(1.5rem, 5vh, 6rem)",
        paddingBottom: "clamp(1.5rem, 5vh, 6rem)",
      }}
    >
      <FloatingOrnaments count={14} hueBase={45} />

      <div className="container-page relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-(--color-primary) sm:text-xs">
            ⋄ ⋄ ⋄
          </p>
          <h2 className="heading-display-lg mb-3">{t("title")}</h2>
          <p className="text-pretty text-base text-(--color-muted-foreground) sm:text-lg">
            {t("subtitle")}
          </p>
        </Reveal>

        <Stagger
          className="mt-6 grid items-start gap-4 sm:grid-cols-2 sm:gap-5 md:mt-10 md:gap-6 lg:grid-cols-4 lg:gap-5"
          step={0.1}
        >
          {TIERS.map((tier) => (
            <StaggerItem key={tier.key}>
              <ParallaxY strength={tier.drift}>
                <TierCard tier={tier} />
              </ParallaxY>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/**
 * Single pricing tier card with a 3D flip mechanism.
 *
 *   • Front face = price + short feature bullets + main CTA.
 *   • Back face  = same features with detailed descriptions, scrollable
 *     if they overflow the card height.
 *   • Info button top-right on the front flips to the back.
 *   • Close (X) button top-right on the back flips back.
 *
 * The flip uses Framer Motion's rotateY on a wrapper that has
 * transform-style: preserve-3d. Front + back are absolutely positioned
 * within the wrapper with backface-visibility: hidden so only the
 * front-facing side is visible at any moment. A 1500px perspective on
 * the outermost element gives the rotation a sense of depth.
 */
function TierCard({ tier }: { tier: Tier }) {
  const t = useTranslations("pricing");
  const [flipped, setFlipped] = useState(false);
  const isHighlight = tier.highlighted ?? false;
  const isLuxe = tier.luxe ?? false;

  // Shared face classes. Front face sits in normal flow and determines
  // the wrapper height (so the card is sized to the content visible
  // before any flip). Back face is absolute inset-0 over the wrapper
  // so it inherits the front's size.
  const faceClasses = cn(
    "flex flex-col overflow-hidden rounded-(--radius-xl) p-5 sm:p-6 md:p-7",
    isHighlight && "border border-(--color-primary)/40 shadow-(--shadow-glow)",
    isLuxe &&
      "border border-(--color-foreground)/30 shadow-[0_24px_60px_-20px_rgb(60_30_15_/_0.35)]",
    !isHighlight &&
      !isLuxe &&
      "border border-(--color-border) bg-white/70 shadow-(--shadow-soft) backdrop-blur",
  );
  const faceColor: React.CSSProperties = isHighlight
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
      : {};

  return (
    <motion.div
      whileHover={{ y: isHighlight || isLuxe ? -6 : -3 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      style={
        {
          "--tier-min-h": `${tier.minH}rem`,
          perspective: "1500px",
        } as React.CSSProperties
      }
      // The wrapper holds the min-height so the staircase silhouette
      // is preserved regardless of which face is showing. h-full so
      // the absolute-positioned faces fill it.
      className="relative h-full w-full lg:[min-height:var(--tier-min-h)]"
    >
      {/* Pop-up badges sit OUTSIDE the flipping inner so they don't
          flip with the card. They render above both faces. */}
      {isHighlight && (
        <div className="pointer-events-none absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full bg-(--color-primary) px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] text-(--color-primary-foreground) shadow-(--shadow-soft)">
          {t("popular")}
        </div>
      )}
      {isLuxe && (
        <div
          className="pointer-events-none absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-[10px] uppercase tracking-[0.2em] shadow-(--shadow-soft)"
          style={{
            background:
              "linear-gradient(135deg, oklch(70% 0.12 50), oklch(85% 0.08 75))",
            color: "oklch(20% 0.04 35)",
          }}
        >
          ★ Эксклюзив
        </div>
      )}

      {/* The flipper itself — animated rotateY between 0° (front) and
          180° (back). preserve-3d keeps the back face hidden when not
          rotated into view. Front face is in normal flow so the
          wrapper sizes to it; back face is absolute inset-0 to match. */}
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {/* ── FRONT FACE ─────────────────────────────────────────── */}
        <div
          className={cn(faceClasses, "h-full")}
          style={{ ...faceColor, backfaceVisibility: "hidden" }}
        >
          {/* Background halo for highlight/luxe — must live INSIDE the
              face so it flips with the card. */}
          {isHighlight && (
            <span
              aria-hidden
              className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-50 blur-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(75% 0.1 35), oklch(85% 0.06 70), oklch(75% 0.1 30))",
              }}
            />
          )}
          {isLuxe && (
            <span
              aria-hidden
              className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-60 blur-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(55% 0.1 35), oklch(70% 0.08 60), oklch(50% 0.09 30))",
              }}
            />
          )}

          {/* Info button — flips to back */}
          <button
            type="button"
            onClick={() => setFlipped(true)}
            aria-label="Подробнее о тарифе"
            className={cn(
              "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-colors",
              isLuxe
                ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                : "bg-(--color-background)/70 text-(--color-muted-foreground) hover:bg-(--color-background) hover:text-(--color-primary)",
            )}
          >
            <Info className="h-4 w-4" strokeWidth={1.8} />
          </button>

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
                isLuxe ? "text-white/60" : "text-(--color-muted-foreground)",
              )}
            >
              {t("currency")}
            </span>
          </div>
          <p
            className={cn(
              "mt-1 text-xs uppercase tracking-[0.18em]",
              isLuxe ? "text-white/50" : "text-(--color-muted-foreground)",
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
        </div>

        {/* ── BACK FACE ──────────────────────────────────────────── */}
        <div
          className={cn(faceClasses, "absolute inset-0")}
          style={{
            ...faceColor,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Halo for highlight/luxe on back too */}
          {isHighlight && (
            <span
              aria-hidden
              className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-50 blur-md"
              style={{
                background:
                  "linear-gradient(135deg, oklch(75% 0.1 35), oklch(85% 0.06 70), oklch(75% 0.1 30))",
              }}
            />
          )}
          {isLuxe && (
            <span
              aria-hidden
              className="absolute -inset-px -z-10 rounded-(--radius-xl) opacity-60 blur-lg"
              style={{
                background:
                  "linear-gradient(135deg, oklch(55% 0.1 35), oklch(70% 0.08 60), oklch(50% 0.09 30))",
              }}
            />
          )}

          {/* Close button — flips back to front */}
          <button
            type="button"
            onClick={() => setFlipped(false)}
            aria-label="Закрыть"
            className={cn(
              "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full transition-colors",
              isLuxe
                ? "bg-white/10 text-white/70 hover:bg-white/20 hover:text-white"
                : "bg-(--color-background)/70 text-(--color-muted-foreground) hover:bg-(--color-background) hover:text-(--color-primary)",
            )}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>

          <div className="mb-3 flex items-baseline justify-between gap-3 pr-12">
            <h3 className="font-display text-xl sm:text-2xl md:text-3xl">
              {t(`${tier.key}.name` as "basic.name")}
            </h3>
            <span
              className={cn(
                "text-[10px] uppercase tracking-[0.2em]",
                isLuxe ? "text-white/50" : "text-(--color-muted-foreground)",
              )}
            >
              {t("detailsTitle")}
            </span>
          </div>

          <div
            className={cn(
              "mb-3 h-px",
              isLuxe ? "bg-white/15" : "bg-(--color-border)",
            )}
          />

          {/* Scrollable detail list — preserves the staircase height by
              keeping the scrollbar inside the card. The slim brand-
              styled scrollbar replaces the system default. */}
          <ul className="scrollbar-slim flex flex-1 flex-col gap-3.5 overflow-y-auto pr-1 text-sm md:gap-4">
            {Array.from({ length: tier.featureCount }, (_, j) => j + 1).map(
              (k) => (
                <li key={k} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid h-4 w-4 shrink-0 place-items-center rounded-full",
                        isLuxe
                          ? "bg-white/10 text-(--color-champagne)"
                          : "bg-(--color-accent)/60 text-(--color-primary)",
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>
                    <span className="font-medium">
                      {t(`${tier.key}.f${k}` as "basic.f1")}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "pl-6 text-xs leading-relaxed",
                      isLuxe ? "text-white/60" : "text-(--color-muted-foreground)",
                    )}
                  >
                    {t(`${tier.key}.f${k}Desc` as "basic.f1Desc")}
                  </p>
                </li>
              ),
            )}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}
