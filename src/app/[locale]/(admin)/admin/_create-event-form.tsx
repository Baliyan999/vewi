"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createEvent, type CreateEventInput } from "./_actions";

export function CreateEventForm() {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const input: CreateEventInput = {
      bride_name: String(fd.get("bride_name") ?? ""),
      groom_name: String(fd.get("groom_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      wedding_date: String(fd.get("wedding_date") ?? ""),
      tariff_code: fd.get("tariff_code") as CreateEventInput["tariff_code"],
      venue_name: (fd.get("venue_name") as string) || null,
      venue_lat: fd.get("venue_lat") ? Number(fd.get("venue_lat")) : null,
      venue_lng: fd.get("venue_lng") ? Number(fd.get("venue_lng")) : null,
      geofence_enabled: fd.get("geofence_enabled") === "on",
    };
    start(async () => {
      const res = await createEvent(input);
      if (res.ok) {
        setCreatedId(res.eventId);
        (e.target as HTMLFormElement).reset();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Невеста</label>
          <Input name="bride_name" required minLength={2} />
        </div>
        <div>
          <label className="text-sm">Жених</label>
          <Input name="groom_name" required minLength={2} />
        </div>
      </div>
      <div>
        <label className="text-sm">Телефон пары</label>
        <Input name="phone" required placeholder="+998 __ ___ __ __" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Дата свадьбы</label>
          <Input name="wedding_date" type="date" required />
        </div>
        <div>
          <label className="text-sm">Тариф</label>
          <select
            name="tariff_code"
            required
            className="h-11 w-full rounded-md border border-(--color-border) bg-(--color-background) px-3 text-sm"
          >
            <option value="basic">Basic</option>
            <option value="pro" defaultChecked>Pro</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm">Площадка (необязательно)</label>
        <Input name="venue_name" placeholder="Ресторан, зал…" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm">Широта (lat)</label>
          <Input name="venue_lat" type="number" step="any" placeholder="41.311081" />
        </div>
        <div>
          <label className="text-sm">Долгота (lng)</label>
          <Input name="venue_lng" type="number" step="any" placeholder="69.240562" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="geofence_enabled" defaultChecked />
        Включить геофенс (QR работает только на площадке)
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {createdId && (
        <div className="rounded-md bg-(--color-muted) p-3 text-sm">
          Событие создано.{" "}
          <a
            href={`/api/admin/qr-pdf/${createdId}`}
            className="font-medium text-(--color-primary) underline"
          >
            Скачать PDF с QR-кодами
          </a>
        </div>
      )}

      <Button type="submit" disabled={pending} size="lg" className="mt-2">
        {pending ? "Создаём…" : "Создать"}
      </Button>
    </form>
  );
}
