"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform, useReducedMotion } from "motion/react";
import { QrCode, Camera, Heart } from "lucide-react";
import { Reveal } from "./reveal";
import { ParallaxY, FloatingOrnaments } from "./parallax";
import { Rings } from "./ornaments";

const ICONS = [QrCode, Camera, Heart] as const;
const STEP_STRENGTHS = [0.05, -0.04, 0.06] as const;

export function How() {
  const t = useTranslations("how");
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 30%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const ringsY = useTransform(scrollYProgress, [0, 1], ["-15%", "30%"]);
  const ringsRotate = useTransform(scrollYProgress, [0, 1], [-8, 6]);
  const titleY = useTransform(scrollYProgress, [0, 1], ["20%", "-10%"]);

  const steps = [1, 2, 3] as const;

  return (
    <section
      id="how"
      ref={sectionRef}
      className="relative overflow-hidden py-24 md:py-32"
    >
      <motion.div
        aria-hidden
        style={{
          y: reduce ? 0 : ringsY,
          rotate: reduce ? 0 : ringsRotate,
        }}
        className="pointer-events-none absolute -right-32 top-20 -z-10 opacity-30"
      >
        <Rings size={720} />
      </motion.div>

      <FloatingOrnaments count={10} hueBase={25} />

      <div className="container-page relative">
        <motion.div style={{ y: reduce ? 0 : titleY }}>
          <Reveal className="mx-auto mb-20 max-w-2xl text-center">
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-(--color-primary)">
              ⋄ ⋄ ⋄
            </p>
            <h2 className="text-balance text-4xl md:text-5xl">{t("title")}</h2>
          </Reveal>
        </motion.div>

        <div className="relative mx-auto max-w-4xl">
          <div className="absolute left-[39px] top-2 hidden h-full w-px bg-(--color-border) md:block">
            <motion.div
              style={{ height: lineHeight }}
              className="w-full origin-top bg-gradient-to-b from-(--color-primary) via-(--color-rose) to-(--color-champagne)"
            />
          </div>

          <ol className="flex flex-col gap-14">
            {steps.map((i, idx) => {
              const Icon = ICONS[idx];
              return (
                <ParallaxY key={i} strength={STEP_STRENGTHS[idx]}>
                  <Reveal delay={idx}>
                    <li className="grid grid-cols-[80px_1fr] items-start gap-6">
                      <motion.div
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        transition={{ type: "spring", stiffness: 280, damping: 18 }}
                        className="relative grid h-20 w-20 place-items-center rounded-full bg-white shadow-(--shadow-soft)"
                        style={{ border: "1px solid oklch(92% 0.015 70)" }}
                      >
                        <Icon className="h-7 w-7 text-(--color-primary)" strokeWidth={1.5} />
                        <span className="absolute -right-1 -top-1 grid h-7 w-7 place-items-center rounded-full bg-(--color-primary) text-xs text-(--color-primary-foreground) font-semibold">
                          {i}
                        </span>
                      </motion.div>

                      <div className="pt-2">
                        <h3 className="mb-2 text-2xl md:text-3xl">
                          {t(`step${i}Title` as "step1Title")}
                        </h3>
                        <p className="max-w-xl text-(--color-muted-foreground)">
                          {t(`step${i}Desc` as "step1Desc")}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                </ParallaxY>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
