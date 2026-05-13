"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { Input, InputLabel } from "@/components/ui/input";
import { Icon } from "@/components/ui/icon";
import { CameraView } from "@/components/camera/camera-view";
import { cn } from "@/lib/utils";

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

type Stage = "name" | "capture";

export function GuestApp({ event, unavailableReason }: GuestEventProps) {
  const t = useTranslations("guest");
  const [stage, setStage] = useState<Stage>("name");
  const [name, setName] = useState<string>("");
  const [uploads, setUploads] = useState(0);
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

  const dateStr = new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(event.wedding_date));

  // Split "Alina & Rustam" → ["Alina", "Rustam"] so the ampersand can use italic gold
  const titleParts = event.title.split(/\s*&\s*/);
  const [first, second] = titleParts.length >= 2
    ? [titleParts[0], titleParts.slice(1).join(" & ")]
    : [event.title, ""];

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex justify-between items-center px-(--space-margin-mobile) border-b-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface)]/95 backdrop-blur-sm">
        <button className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)]">
          <Icon name="menu" size={22} />
        </button>
        <span className="text-display-md tracking-tight text-[color:var(--color-on-surface)]">
          VEWI
        </span>
        <button className="text-[color:var(--color-on-surface)] hover:text-[color:var(--color-accent-gold)]">
          <Icon name="account_circle" size={22} />
        </button>
      </header>

      <main className="flex-1 pt-24 pb-12 px-(--space-margin-mobile) flex flex-col items-center max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          {stage === "name" ? (
            <NameCard
              key="name"
              event={{ first, second, dateStr }}
              name={name}
              setName={setName}
              onContinue={() => setStage("capture")}
              onAnonymous={() => {
                setName("");
                setStage("capture");
              }}
            />
          ) : (
            <CaptureCard
              key="capture"
              name={name}
              uploads={uploads}
              total={event.photos_per_guest}
              onAdd={() => {
                setCameraOpen(true);
                setUploads((u) => Math.min(u + 1, event.photos_per_guest));
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NameCard({
  event,
  name,
  setName,
  onContinue,
  onAnonymous,
}: {
  event: { first: string; second: string; dateStr: string };
  name: string;
  setName: (s: string) => void;
  onContinue: () => void;
  onAnonymous: () => void;
}) {
  const t = useTranslations("guest");

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] p-8 flex flex-col items-center text-center gap-7">
        {/* Couple name */}
        <div>
          <h1 className="text-headline-md text-[color:var(--color-on-surface)]">
            {event.first}
            {event.second && (
              <>
                {" "}
                <span className="italic text-[color:var(--color-accent-gold)]">&amp;</span>{" "}
                {event.second}
              </>
            )}
          </h1>
          <p className="label-caps text-[color:var(--color-on-surface-variant)] mt-2">
            {event.dateStr}
          </p>
        </div>

        {/* Name input */}
        <div className="w-full text-left">
          <InputLabel htmlFor="g-name">{t("askName")}</InputLabel>
          <Input
            id="g-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            maxLength={40}
            autoFocus
          />
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            onClick={onContinue}
            disabled={!name.trim()}
            className="h-12 w-full bg-[color:var(--color-accent-gold)] text-[color:var(--color-background)] label-caps flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 hover:opacity-90 transition-opacity"
          >
            {t("signIn")}
            <Icon name="arrow_forward" size={16} />
          </button>
          <button
            onClick={onAnonymous}
            className="h-12 w-full border-[0.5px] border-[color:var(--color-outline-variant)] text-[color:var(--color-on-surface-variant)] label-caps hover:border-[color:var(--color-accent-gold)] hover:text-[color:var(--color-accent-gold)] transition-colors"
          >
            {t("anonymous")}
          </button>
        </div>
      </div>
    </motion.section>
  );
}

function CaptureCard({
  name,
  uploads,
  total,
  onAdd,
}: {
  name: string;
  uploads: number;
  total: number;
  onAdd: () => void;
}) {
  const t = useTranslations("guest");
  const greeting = name.trim()
    ? t("helloName", { name: name.trim() })
    : t("helloAnonymous");

  // 5 slots — first is the hero (col-span-2), then 4 smaller below
  const slots: ("filled" | "empty")[] = Array.from({ length: 5 }, (_, i) =>
    i < uploads ? "filled" : "empty",
  );

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="w-full"
    >
      <div className="border-[0.5px] border-[color:var(--color-outline-variant)] bg-[color:var(--color-surface-container-low)] p-8 flex flex-col gap-6 text-center">
        <div>
          <h1 className="text-headline-md text-[color:var(--color-on-surface)]">
            {greeting}
          </h1>
          <p className="text-body-md mt-2">{t("captureTitle")}</p>
          <p className="label-caps text-[10px] text-[color:var(--color-on-surface-variant)] mt-3">
            {t("captureSubtitle")}
          </p>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 gap-1">
          <Slot kind={slots[0]} large />
          <Slot kind={slots[1]} />
          <Slot kind={slots[2]} />
          <Slot kind={slots[3]} />
          <Slot kind={slots[4]} />
        </div>

        <p className="label-caps text-[10px] text-[color:var(--color-on-surface-variant)]">
          {t("uploadedStatus", { count: uploads })}
        </p>

        <button
          onClick={onAdd}
          disabled={uploads >= total}
          className={cn(
            "h-12 w-full bg-[color:var(--color-accent-gold)] text-[color:var(--color-background)] label-caps flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:opacity-80 hover:opacity-90 transition-opacity",
          )}
        >
          <Icon name="add" size={18} />
          {t("addMore")}
        </button>
      </div>
    </motion.section>
  );
}

function Slot({ kind, large = false }: { kind: "filled" | "empty"; large?: boolean }) {
  return (
    <div
      className={cn(
        "aspect-square border-[0.5px] border-[color:var(--color-outline-variant)] grid place-items-center",
        large && "col-span-2 aspect-video",
        kind === "filled"
          ? "bg-[color:var(--color-surface-container)]"
          : "bg-[color:var(--color-surface)]",
      )}
    >
      {kind === "filled" ? (
        <Icon
          name="check"
          weight={300}
          size={20}
          className="text-[color:var(--color-accent-gold)] opacity-60"
        />
      ) : (
        <Icon
          name="add_a_photo"
          weight={300}
          size={20}
          className="text-[color:var(--color-on-surface-variant)] opacity-40"
        />
      )}
    </div>
  );
}
