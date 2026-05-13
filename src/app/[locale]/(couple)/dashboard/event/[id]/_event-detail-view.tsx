"use client";

import { useState } from "react";
import { EventHeader } from "@/components/couple/event-header";
import { StatGrid } from "@/components/couple/stat-grid";
import { Gallery, type GalleryItem } from "@/components/couple/gallery";
import { UpsellRow } from "@/components/couple/upsell-row";

type Props = {
  event: {
    id: string;
    title: string;
    wedding_date: string;
    status: string;
    expires_at: string;
    photos_count: number;
    videos_count: number;
    guests_count: number;
    highlights_count: number;
    brand_color: string | null;
    tariff_code: string;
    cover_url: string | null;
  };
  items: GalleryItem[];
  extensions: { id: string; extends_by_days: number; price_uzs: number; applied_at: string | null }[];
  basePath: "/dashboard" | "/dashboard/demo";
  demo?: boolean;
};

export function EventDetailView({
  event,
  items,
  extensions,
  basePath,
  demo = false,
}: Props) {
  const [working, setWorking] = useState(false);

  async function generateHighlights() {
    if (demo) {
      alert("Демо: AI-подборка работает только с реальными фото");
      return;
    }
    if (working) return;
    setWorking(true);
    try {
      await fetch(`/api/couple/highlights/${event.id}`, { method: "POST" });
      window.location.reload();
    } finally {
      setWorking(false);
    }
  }

  return (
    <>
      <EventHeader
        event={event}
        basePath={basePath}
        onGenerateHighlights={generateHighlights}
        demo={demo}
      />
      <StatGrid
        photos={event.photos_count}
        videos={event.videos_count}
        guests={event.guests_count}
        highlights={event.highlights_count}
      />
      <Gallery items={items} demo={demo} />
      <UpsellRow event={event} extensions={extensions} demo={demo} />
    </>
  );
}
