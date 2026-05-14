"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Tv, Video, Mic, Hand, ShieldCheck, Send } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "./reveal";
import { DriftingOrbs, FloatingOrnaments } from "./parallax";

const icons = [Tv, Video, Mic, Hand, ShieldCheck, Send] as const;

export function Features() {
  const t = useTranslations("features");
  const items = [1, 2, 3, 4, 5, 6] as const;

  return (
    <section
      id="features"
      className="relative overflow-hidden py-24 md:py-32"
    >
      <DriftingOrbs variant="mix" />
      <FloatingOrnaments count={18} hueBase={20} hueSpread={70} />

      <div className="container-page relative">
        <Reveal className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-(--color-primary)">
            ⋄ ⋄ ⋄
          </p>
          <h2 className="mb-4 text-4xl md:text-5xl">{t("title")}</h2>
          <p className="text-(--color-muted-foreground)">{t("subtitle")}</p>
        </Reveal>

        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" step={0.07}>
          {items.map((i) => {
            const Icon = icons[i - 1];
            return (
              <StaggerItem key={i}>
                <FeatureCard
                  icon={<Icon className="h-6 w-6" strokeWidth={1.5} />}
                  title={t(`f${i}Title` as "f1Title")}
                  desc={t(`f${i}Desc` as "f1Desc")}
                />
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, mx: 50, my: 50 });

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: -y * 8,
      ry: x * 10,
      mx: (x + 0.5) * 100,
      my: (y + 0.5) * 100,
    });
  }

  return (
    <motion.div
      onMouseMove={onMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0, mx: 50, my: 50 })}
      style={{
        transformStyle: "preserve-3d",
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className="surface-card group relative h-full overflow-hidden rounded-(--radius-lg) p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle 200px at ${tilt.mx}% ${tilt.my}%, oklch(98% 0.04 70 / 0.7), transparent 70%)`,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-(--color-accent)/40 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />
      <div
        className="relative mb-5 grid h-12 w-12 place-items-center rounded-xl text-(--color-primary)"
        style={{
          background:
            "linear-gradient(135deg, oklch(94% 0.04 70), oklch(88% 0.05 60))",
          transform: "translateZ(30px)",
        }}
      >
        {icon}
      </div>
      <h3
        className="relative mb-2 text-2xl"
        style={{ transform: "translateZ(20px)" }}
      >
        {title}
      </h3>
      <p
        className="relative text-sm text-(--color-muted-foreground)"
        style={{ transform: "translateZ(10px)" }}
      >
        {desc}
      </p>
    </motion.div>
  );
}
