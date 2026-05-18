"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { DayPicker } from "react-day-picker";
import { ru, uz } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import "react-day-picker/style.css";

/**
 * DatePicker — text input + locale-aware popup calendar.
 *
 * Native <input type="date"> shows browser-locale strings on the
 * picker UI ("январь", "февраль", … in RU Chrome) regardless of the
 * page locale, with no spec-compliant override. This component
 * replaces the native widget with react-day-picker, which we feed
 * the next-intl active locale via date-fns/locale (ru | uz).
 *
 * The hidden text input keeps the form's FormData wiring intact: it
 * carries an ISO `YYYY-MM-DD` value under the same `name` the rest of
 * the form expects, so the submit handler doesn't need to change.
 */
export function DatePicker({
  id,
  name,
  className,
}: {
  id: string;
  name: string;
  className?: string;
}) {
  const locale = useLocale();
  const dfLocale = locale === "uz" ? uz : ru;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click / escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ISO string for the hidden field — date-fns isn't needed for this,
  // toISOString() then slice the date portion. We use noon UTC to dodge
  // timezone edge cases where the date could roll backward.
  function toIso(d: Date | undefined): string {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // Display label — formatted by date-fns/locale so the user sees the
  // date in their locale's order/labels.
  function displayLabel(d: Date | undefined): string {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${day}.${m}.${y}`;
  }

  const today = new Date();

  return (
    <div ref={wrapperRef} className="relative">
      {/* Hidden ISO value — what the submit handler sees via FormData. */}
      <input type="hidden" name={name} value={toIso(selected)} />

      {/* Visible "input" — actually a button so the click area is the
          whole row and there's no native picker getting in the way. */}
      <button
        type="button"
        id={id}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={
          "flex h-11 w-full items-center justify-between rounded-md border border-(--color-border) bg-white px-3 text-sm text-(--color-foreground) shadow-sm transition-colors hover:border-(--color-primary)/40 focus:outline-none focus:ring-2 focus:ring-(--color-ring) " +
          (className ?? "")
        }
      >
        <span className={selected ? "" : "text-(--color-muted-foreground)"}>
          {displayLabel(selected) ||
            (locale === "uz" ? "KK.OO.YYYY" : "ДД.ММ.ГГГГ")}
        </span>
        <Calendar
          className="h-4 w-4 shrink-0 text-(--color-muted-foreground)"
          strokeWidth={1.6}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-[calc(100%+6px)] z-50 rounded-lg border border-(--color-border) bg-white p-2 shadow-(--shadow-glow)"
          >
            <DayPicker
              mode="single"
              selected={selected}
              onSelect={(d) => {
                setSelected(d);
                if (d) setOpen(false);
              }}
              locale={dfLocale}
              weekStartsOn={1}
              startMonth={new Date(today.getFullYear(), today.getMonth())}
              endMonth={new Date(today.getFullYear() + 3, 11)}
              disabled={{ before: today }}
              showOutsideDays
              className="rdp-memour"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
