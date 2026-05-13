"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input, InputLabel } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { FilmStrip } from "@/components/ui/film-strip";
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
      guests_estimate: fd.get("guests") ? Number(fd.get("guests")) : null,
      source: "landing",
    };
    startTransition(async () => {
      const res = await submitLead(data);
      if (res.ok) setSuccess(true);
      else setError(res.error);
    });
  }

  return (
    <div className="max-w-xl mx-auto px-(--space-margin-mobile)">
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <Icon
              name="favorite"
              fill={1}
              size={40}
              className="text-[color:var(--color-accent-gold)] mb-6 inline-block"
            />
            <h3 className="text-headline-md text-[color:var(--color-on-surface)] mb-3">
              {t("successTitle")}
            </h3>
            <p className="text-body-md">{t("successDesc")}</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            className="flex flex-col gap-7"
          >
            <div className="text-center">
              <p className="label-caps text-[color:var(--color-accent-gold)] mb-3">
                Apply for an invitation
              </p>
              <h3 className="text-headline-md text-[color:var(--color-on-surface)] mb-2">
                {t("title")}
              </h3>
              <p className="text-body-md">{t("subtitle")}</p>
            </div>

            <FilmStrip />

            <div>
              <InputLabel htmlFor="name">{t("name")}</InputLabel>
              <Input id="name" name="name" required minLength={2} />
            </div>
            <div>
              <InputLabel htmlFor="phone">{t("phone")}</InputLabel>
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="+998 __ ___ __ __"
                inputMode="tel"
              />
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <InputLabel htmlFor="wedding_date">{t("weddingDate")}</InputLabel>
                <Input id="wedding_date" name="wedding_date" type="date" />
              </div>
              <div>
                <InputLabel htmlFor="guests">{t("guests")}</InputLabel>
                <Input id="guests" name="guests" type="number" min={10} max={1000} />
              </div>
            </div>
            {error && <p className="text-body-md text-red-600">{error}</p>}
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? t("submitting") : t("submit")}
              <Icon name="arrow_forward" className="text-[16px]" />
            </Button>
            <p className="text-center text-[11px] text-[color:var(--color-on-surface-variant)]">
              Telegram / WhatsApp — ответим в течение часа
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
