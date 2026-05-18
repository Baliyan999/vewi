"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "./date-picker";
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
        className="surface-card relative rounded-(--radius-xl) p-6 sm:p-8 md:p-12"
      >
        {/* Decorative orbs in their own overflow-hidden layer so the
            calendar popup can escape the card bounds without being
            clipped. The form card itself is overflow-visible. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-(--radius-xl)">
          <div
            aria-hidden
            className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-(--color-rose)/30 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -left-12 -bottom-16 h-56 w-56 rounded-full bg-(--color-champagne)/40 blur-3xl"
          />
        </div>

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
                <h3 className="heading-display-md">{t("title")}</h3>
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
                  {/* Custom locale-aware date picker — native
                      <input type="date"> is locked to the browser UI
                      locale ("январь" in RU Chrome regardless of page
                      lang). The DatePicker wrapper uses
                      react-day-picker + date-fns/locale (ru | uz) so
                      the popup respects the active app locale. */}
                  <DatePicker id="wedding_date" name="wedding_date" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="guests" className="text-xs uppercase tracking-wider text-(--color-muted-foreground)">
                    {t("guests")}
                  </label>
                  <GuestStepper id="guests" name="guests" min={10} max={1000} />
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
                {t("contactNote")}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

/**
 * GuestStepper — replaces the native <input type=number> spinner with
 * brand-styled +/- buttons stacked on the right edge. Hides the native
 * spinners via Tailwind arbitrary CSS for both WebKit and Firefox.
 *
 * Uses an uncontrolled ref to the underlying input so the existing
 * FormData-based submit handler keeps reading the value via the input's
 * `name`. We don't React-control the value, the buttons just dispatch
 * synthetic input events to keep React state and DOM in sync.
 */
function GuestStepper({
  id,
  name,
  min,
  max,
  step = 1,
}: {
  id: string;
  name: string;
  min: number;
  max: number;
  step?: number;
}) {
  const ref = useRef<HTMLInputElement>(null);

  function bump(direction: 1 | -1) {
    const el = ref.current;
    if (!el) return;
    const current = Number(el.value || "");
    const next = Number.isFinite(current)
      ? current + direction * step
      : direction === 1
        ? min
        : max;
    const clamped = Math.min(max, Math.max(min, next));
    // Setting el.value directly bypasses React's synthetic event chain.
    // For uncontrolled inputs that's fine — FormData reads the DOM value.
    el.value = String(clamped);
  }

  return (
    <div className="relative">
      <Input
        ref={ref}
        id={id}
        name={name}
        type="number"
        min={min}
        max={max}
        step={step}
        // Hide native spinners — Firefox uses appearance:textfield,
        // WebKit uses ::-webkit-{inner,outer}-spin-button. The arbitrary
        // values below cover both.
        className="bg-white pr-8 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="pointer-events-none absolute inset-y-2 right-2 flex w-5 flex-col">
        <button
          type="button"
          aria-label="+1"
          onClick={() => bump(1)}
          className="pointer-events-auto flex flex-1 items-center justify-center rounded-t-sm text-(--color-muted-foreground) transition-colors hover:bg-(--color-accent)/50 hover:text-(--color-primary)"
        >
          <ChevronUp className="h-3 w-3" strokeWidth={2} />
        </button>
        <button
          type="button"
          aria-label="-1"
          onClick={() => bump(-1)}
          className="pointer-events-auto flex flex-1 items-center justify-center rounded-b-sm text-(--color-muted-foreground) transition-colors hover:bg-(--color-accent)/50 hover:text-(--color-primary)"
        >
          <ChevronDown className="h-3 w-3" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
