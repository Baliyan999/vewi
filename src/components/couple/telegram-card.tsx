"use client";

import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Send } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function TelegramCard({ botUsername }: { botUsername: string | null }) {
  const t = useTranslations("couple.telegramCard");
  if (!botUsername) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="surface-card relative overflow-hidden rounded-(--radius-xl) p-6 md:flex md:items-center md:justify-between md:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-(--color-rose)/30 blur-3xl"
      />
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-[#229ED9] text-white shadow-(--shadow-soft)">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-xl">{t("title")}</h3>
          <p className="mt-1 max-w-md text-sm text-(--color-muted-foreground)">
            {t("desc")}
          </p>
        </div>
      </div>
      <a
        href={`https://t.me/${botUsername}?start=link`}
        target="_blank"
        rel="noreferrer"
        className={cn(
          buttonVariants({ size: "sm" }),
          "mt-4 w-full justify-center md:mt-0 md:w-auto",
        )}
      >
        {t("cta")}
      </a>
    </motion.div>
  );
}
