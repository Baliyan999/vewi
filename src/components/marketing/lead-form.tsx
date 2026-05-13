"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Reveal } from "./reveal";
import { submitLead, type LeadInput } from "@/app/_actions/lead";

export function LeadForm() {
  const t = useTranslations("lead");
  const [pending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data: LeadInput = {
      name: String(fd.get("name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      wedding_date: (fd.get("wedding_date") as string) || null,
      guests_estimate: fd.get("guests")
        ? Number(fd.get("guests"))
        : null,
      source: "landing",
    };
    startTransition(async () => {
      const res = await submitLead(data);
      if (res.ok) setSuccess(true);
      else setError(res.error);
    });
  }

  return (
    <Reveal className="mx-auto max-w-xl">
      <div
        className="surface-card relative overflow-hidden rounded-(--radius-xl) p-8 md:p-12"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-(--color-rose)/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-12 -bottom-16 h-56 w-56 rounded-full bg-(--color-champagne)/40 blur-3xl"
        />

        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
                className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full bg-(--color-primary) text-white animate-pulse-ring"
              >
                <Heart className="h-7 w-7" />
              </motion.div>
              <h3 className="text-3xl">{t("successTitle")}</h3>
              <p className="mt-3 text-(--color-muted-foreground)">
                {t("successDesc")}
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={onSubmit}
              className="relative flex flex-col gap-5"
            >
              <div className="text-center">
                <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-(--color-accent)/50 px-3.5 py-1 text-xs uppercase tracking-[0.2em] text-(--color-primary)">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Без обязательств
                </div>
                <h3 className="text-3xl md:text-4xl">{t("title")}</h3>
                <p className="mt-2 text-sm text-(--color-muted-foreground)">
                  {t("subtitle")}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-xs uppercase tracking-wider text-(--color-muted-foreground)">
                  {t("name")}
                </label>
                <Input id="name" name="name" required minLength={2} className="bg-white" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="phone" className="text-xs uppercase tracking-wider text-(--color-muted-foreground)">
                  {t("phone")}
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="+998 __ ___ __ __"
                  inputMode="tel"
                  className="bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="wedding_date" className="text-xs uppercase tracking-wider text-(--color-muted-foreground)">
                    {t("weddingDate")}
                  </label>
                  <Input id="wedding_date" name="wedding_date" type="date" className="bg-white" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="guests" className="text-xs uppercase tracking-wider text-(--color-muted-foreground)">
                    {t("guests")}
                  </label>
                  <Input id="guests" name="guests" type="number" min={10} max={1000} className="bg-white" />
                </div>
              </div>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {error}
                </motion.p>
              )}
              <Button type="submit" size="lg" disabled={pending} className="shadow-(--shadow-soft)">
                {pending ? t("submitting") : t("submit")}
              </Button>
              <p className="text-center text-[11px] text-(--color-muted-foreground)">
                Связь через Telegram / WhatsApp в течение часа
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}
