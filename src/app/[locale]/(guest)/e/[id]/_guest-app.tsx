"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
        <div>
          <p className="text-lg">
            {unavailableReason === "expired"
              ? "Альбом этой свадьбы уже закрыт."
              : "Эта свадьба ещё не активна или уже закончилась."}
          </p>
        </div>
      </div>
    );
  }

  if (stage === "camera") {
    return <CameraView event={event} guestName={name || undefined} />;
  }

  return (
    <div
      className="relative flex min-h-dvh flex-col"
      style={{
        background: event.brand_color
          ? `linear-gradient(180deg, ${event.brand_color}20 0%, transparent 100%)`
          : undefined,
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
        <p className="mb-1 text-xs uppercase tracking-[0.2em] text-(--color-muted-foreground)">
          {t("splashHello")}
        </p>
        <h1
          className="text-balance text-4xl md:text-5xl"
          style={{ color: event.brand_color ?? undefined }}
        >
          {event.title}
        </h1>
        <p className="mt-2 text-(--color-muted-foreground)">
          {new Intl.DateTimeFormat("ru-RU", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }).format(new Date(event.wedding_date))}
        </p>
        <p className="mx-auto mt-8 max-w-sm text-(--color-muted-foreground)">
          {t("splashSubtitle")}
        </p>

        {stage === "splash" && (
          <Button size="lg" className="mt-10" onClick={() => setStage("name")}>
            {t("ctaStart")}
          </Button>
        )}

        {stage === "name" && (
          <div className="mt-10 flex w-full max-w-sm flex-col gap-3">
            <label className="text-sm">{t("askName")}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              maxLength={40}
              autoFocus
            />
            <Button size="lg" onClick={() => setStage("camera")}>
              {t("continue")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
