"use client";

import { useState, useTransition } from "react";
import { motion } from "motion/react";
import { Palette, ImageUp, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveBranding } from "./_actions";

type Props = {
  event: {
    id: string;
    brand_color: string;
    cover_url: string | null;
  };
};

const PALETTE_PRESETS = [
  "#c89c66",
  "#b88670",
  "#a86d5b",
  "#d2a679",
  "#8e7458",
  "#6b8f7a",
  "#4a6741",
  "#7d6f8c",
];

export function BrandingForm({ event }: Props) {
  const [color, setColor] = useState(event.brand_color);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(event.cover_url);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData();
    fd.append("event_id", event.id);
    fd.append("brand_color", color);
    if (coverFile) fd.append("cover", coverFile);

    start(async () => {
      const res = await saveBranding(fd);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="surface-card rounded-(--radius-lg) border-0">
          <CardHeader>
            <div className="mb-1 grid h-10 w-10 place-items-center rounded-lg bg-(--color-accent)/60 text-(--color-primary)">
              <Palette className="h-5 w-5" />
            </div>
            <CardTitle className="font-display text-2xl">Цвет и обложка</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div>
              <label className="mb-3 block text-sm font-medium">Основной цвет</label>
              <div className="flex items-center gap-3">
                <label
                  className="relative h-12 w-12 cursor-pointer overflow-hidden rounded-lg shadow-(--shadow-soft)"
                  style={{ background: color }}
                >
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </label>
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="bg-white font-mono"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {PALETTE_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="h-8 w-8 rounded-full shadow-sm ring-1 ring-(--color-border) transition-transform hover:scale-110"
                    style={{ background: c }}
                    aria-label={`Цвет ${c}`}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Обложка пары</label>
              <p className="mb-3 text-xs text-(--color-muted-foreground)">
                Квадратное фото, до 5 МБ. Появится на splash-странице гостей и в кабинете.
              </p>
              <label className="flex h-32 cursor-pointer items-center justify-center rounded-(--radius-lg) border-2 border-dashed border-(--color-border) bg-white/50 transition-colors hover:bg-white">
                <input type="file" accept="image/*" onChange={onPick} className="sr-only" />
                <div className="flex flex-col items-center gap-1.5 text-(--color-muted-foreground)">
                  <ImageUp className="h-5 w-5" />
                  <span className="text-sm">
                    {coverFile ? coverFile.name : coverPreview ? "Заменить" : "Выбрать файл"}
                  </span>
                </div>
              </label>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={pending} size="lg" className="shadow-(--shadow-soft)">
                {pending ? "Сохраняем…" : "Сохранить"}
              </Button>
              {saved && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="inline-flex items-center gap-1.5 text-sm text-emerald-700"
                >
                  <Check className="h-4 w-4" /> Сохранено
                </motion.span>
              )}
              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="surface-card rounded-(--radius-lg) border-0">
          <CardHeader>
            <CardTitle className="font-display text-xl">Как это увидят гости</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-(--radius-lg) text-white shadow-(--shadow-soft)"
              style={{
                background: coverPreview
                  ? `linear-gradient(180deg, transparent 30%, ${color}d4 100%), center / cover no-repeat url(${coverPreview})`
                  : `linear-gradient(180deg, ${color}d4 0%, ${color} 100%)`,
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-center">
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em] text-white/85">
                  Добро пожаловать
                </p>
                <p className="font-display text-3xl">Алишер и Дильноза</p>
                <p className="mt-2 text-xs text-white/85">
                  Помогите собрать самый полный альбом
                </p>
                <button
                  type="button"
                  className="mx-auto mt-5 rounded-full bg-white/90 px-5 py-2 text-xs text-(--color-foreground) backdrop-blur"
                >
                  Сделать первое фото
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </form>
  );
}
