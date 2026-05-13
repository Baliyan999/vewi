"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input, InputLabel } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { FilmStrip } from "@/components/ui/film-strip";
import { CameraView } from "@/components/camera/camera-view";

export type GuestEventProps = {
  event: {
    id: string;
    title: string;
    wedding_date: string;
    brand_color: string | null;
    cover_image_path: string | null;
    photos_per_guest: number;
    videos_per_guest: number;
    videos_enabled: boolean;
    geofence_enabled?: boolean;
    venue_lat?: number | null;
    venue_lng?: number | null;
    venue_radius_m?: number | null;
  } | null;
  unavailableReason?: "not_active" | "expired";
};

type Stage = "splash" | "name" | "camera";

export function GuestApp({ event, unavailableReason }: GuestEventProps) {
  const t = useTranslations("guest");
  const [stage, setStage] = useState<Stage>("splash");
  const [name, setName] = useState<string>("");

  if (!event) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 text-center">
        <div className="max-w-sm">
          <Icon
            name="event_busy"
            weight={300}
            size={36}
            className="text-[color:var(--color-accent-gold)] mb-4 inline-block"
          />
          <p className="text-headline-sm text-[color:var(--color-on-surface)] mb-2">
            {unavailableReason === "expired" ? "Альбом закрыт" : "Свадьба не активна"}
          </p>
          <p className="text-body-md">
            {unavailableReason === "expired"
              ? "Окно загрузки фото для этой свадьбы закончилось."
              : "Сейчас не время торжества — попробуйте ближе к дате свадьбы."}
          </p>
        </div>
      </div>
    );
  }

  if (stage === "camera") {
    return <CameraView event={event} guestName={name || undefined} />;
  }

  const dateStr = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.wedding_date));

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex justify-between items-center px-(--space-margin-mobile) border-b-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)]/95 backdrop-blur-sm">
        <button className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)]">
          <Icon name="menu" size={22} />
        </button>
        <h1 className="text-display-md tracking-tight text-[color:var(--color-on-surface)]">
          VEWI
        </h1>
        <button className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)]">
          <Icon name="account_circle" size={22} />
        </button>
      </header>

      <main className="flex-1 pt-24 pb-32 px-(--space-margin-mobile) flex flex-col items-center text-center max-w-md mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex flex-col items-center"
        >
          <p className="label-caps text-[color:var(--color-accent-gold)] mb-3">
            {t("splashHello")}
          </p>
          <h2 className="text-display-md italic text-[color:var(--color-on-surface)] mb-2">
            {event.title}
          </h2>
          <p className="label-caps text-[color:var(--color-on-surface-variant)] mb-10">
            {dateStr}
          </p>

          <FilmStrip className="mb-10 max-w-xs" />

          <p className="text-body-md mb-10 max-w-xs">{t("splashSubtitle")}</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === "splash" ? (
            <motion.div
              key="splash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full"
            >
              <Button size="lg" onClick={() => setStage("name")} className="w-full">
                {t("ctaStart")}
                <Icon name="photo_camera" className="text-[18px]" />
              </Button>
              <p className="label-caps text-[color:var(--color-on-surface-variant)] mt-6">
                {event.photos_per_guest} photos · {event.videos_per_guest} videos
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full flex flex-col gap-6"
            >
              <div className="text-left">
                <InputLabel htmlFor="guest-name">{t("askName")}</InputLabel>
                <Input
                  id="guest-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  maxLength={40}
                  autoFocus
                />
              </div>
              <Button size="lg" onClick={() => setStage("camera")}>
                {t("continue")}
                <Icon name="arrow_forward" className="text-[18px]" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
