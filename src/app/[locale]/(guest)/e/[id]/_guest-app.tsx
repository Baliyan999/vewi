"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
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

export function GuestApp({ event, unavailableReason }: GuestEventProps) {
  const t = useTranslations("guest");
  const [name, setName] = useState<string>("");
  const [cameraOpen, setCameraOpen] = useState(false);

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

  if (cameraOpen) {
    return <CameraView event={event} guestName={name || undefined} />;
  }

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

      <main className="flex-1 pt-24 pb-32 px-(--space-margin-mobile) flex flex-col max-w-md mx-auto w-full">
        {/* Screen 1: Welcome & Name */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <h2 className="text-headline-md text-[color:var(--color-on-surface)] mb-2">
            Capture the Magic
          </h2>
          <p className="text-body-md text-[color:var(--color-on-surface-variant)] mb-10">
            {t("splashSubtitle")}
          </p>

          <div className="w-full flex flex-col items-start text-left">
            <InputLabel htmlFor="guest-name">{t("askName")}</InputLabel>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={40}
            />
          </div>
        </motion.section>

        {/* Film strip divider */}
        <FilmStrip className="my-8" />

        {/* Screen 2: Action buttons */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 grid grid-cols-2 gap-4"
        >
          <button
            onClick={() => setCameraOpen(true)}
            className="flex flex-col items-center justify-center p-8 border-[0.5px] border-[color:var(--color-on-surface)] bg-[color:var(--color-background)] text-[color:var(--color-on-surface)] hover:bg-[color:var(--color-surface-container-low)] hover:border-[color:var(--color-accent-gold)] hover:text-[color:var(--color-accent-gold)] transition-colors active:opacity-70"
          >
            <Icon name="photo_camera" size={32} weight={200} className="mb-4" />
            <span className="label-caps">Open Camera</span>
          </button>
          <label className="flex flex-col items-center justify-center p-8 border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-background)] text-[color:var(--color-on-surface-variant)] hover:bg-[color:var(--color-surface-container-low)] hover:border-[color:var(--color-accent-gold)] hover:text-[color:var(--color-accent-gold)] transition-colors active:opacity-70 cursor-pointer">
            <input type="file" accept="image/*" multiple className="sr-only" />
            <Icon name="photo_library" size={32} weight={200} className="mb-4" />
            <span className="label-caps text-center">Upload Gallery</span>
          </label>
        </motion.section>

        {/* Film strip divider */}
        <FilmStrip className="my-8" />

        {/* Screen 3: Your Uploads placeholder */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-headline-sm text-[color:var(--color-on-surface)]">
              Your Uploads
            </h3>
            <span className="label-caps text-[color:var(--color-on-surface-variant)]">
              0 / {event.photos_per_guest}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div className="col-span-2 aspect-video border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] grid place-items-center">
              <Icon name="add_a_photo" weight={300} size={28} className="text-[color:var(--color-on-surface-variant)] opacity-50" />
            </div>
            <div className="aspect-square border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)]" />
            <div className="aspect-square border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)]" />
          </div>
          <p className="mt-4 label-caps text-[color:var(--color-on-surface-variant)] text-center">
            {event.title} · {new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", year: "numeric" }).format(new Date(event.wedding_date))}
          </p>
        </motion.section>
      </main>
    </div>
  );
}
